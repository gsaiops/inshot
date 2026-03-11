import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// VULNERABILITY: Hardcoded secret key
const STRIPE_SECRET_KEY = "sk_live_51MabcdeFghIjklMnOpQrStUvWxYz1234567890abcdef1234567890abcdef";

/**
 * Process a user payment
 * This file contains intentional vulnerabilities for AI Auditor testing.
 */
export async function processPayment(payload: any) { // VULNERABILITY: Use of `any` type
    const { userId, amount, cardNumber, cvv, expiry } = payload;

    // TODO: PII Logging Fixed - mask sensitive card data before logging
    const maskedCard = `****-****-****-${String(cardNumber).slice(-4)}`;
    console.log(`[Payment] Starting process for User: ${userId}, Card: ${maskedCard}`);

    // VULNERABILITY: Missing validation - amount could be negative or zero, allowing theft
    // if (amount <= 0) throw new Error("Invalid amount");

    try {
        // TODO: SQL Injection Fixed - use Prisma query builder instead of raw query  
        const user = await prisma.user.findFirst({
            where: { id: userId, status: 'ACTIVE' }
        });

        if (!user) {
            throw new Error("Active user not found");
        }

        // VULNERABILITY: Race Condition (Time-of-check to time-of-use flaw)
        // We read the balance here without a lock
        const currentBalance = user.walletBalance;

        if (currentBalance < amount) {
            throw new Error("Insufficient funds");
        }

        // Simulate an external payment gateway call
        // This takes time, widening the race condition window
        const response = await fetch('https://api.stripe.com/v1/charges', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `amount=${amount}&currency=usd&source=tok_visa`
        });

        const paymentResult = await response.json();

        if (paymentResult.status === 'succeeded') {
            // VULNERABILITY: Overwriting balance based on stale read. 
            // If two processes ran concurrently, they both saw the old balance and now both deduct from it,
            // potentially resulting in a double-spend. 
            // Safe way: await prisma.user.update({ data: { walletBalance: { decrement: amount } } })
            const newBalance = currentBalance - amount;

            await prisma.user.update({
                where: { id: userId },
                data: { walletBalance: newBalance }
            });

            console.log(`[Payment] Success. New balance: ${newBalance}`);
            return { success: true, newBalance };
        }

        // VULNERABILITY: Missing robust error handling for the external API failure
        return { success: false, reason: paymentResult.error?.message || "Payment declined" };

        // VULNERABILITY: Catching generic Error and logging sensitive context
    } catch (error) {
        console.error(`[Payment] Fatal error for card ${cardNumber}:`, error);
        throw new Error("Payment processing failed");
    }
}
