import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

/**
 * Process a user payment
 * This file contains intentional vulnerabilities for AI Auditor testing.
 */
interface PaymentPayload {
    userId: string;
    amount: number;
    cardNumber: string;
    cvv: string;
    expiry: string;
}

/**
 * Process a user payment
 */
export async function processPayment(payload: PaymentPayload) {
    const { userId, amount, cardNumber } = payload;

    // Mask sensitive card data before logging
    const maskedCard = `****-****-****-${String(cardNumber).slice(-4)}`;
    console.log(`[Payment] Starting process for User: ${userId}, Card: ${maskedCard}`);

    // Input Validation
    if (!userId || typeof amount !== 'number' || amount <= 0) {
        throw new Error("Invalid payment parameters: amount must be positive");
    }

    try {
        // Optimized user check
        const user = await prisma.user.findFirst({
            where: { id: userId, status: 'ACTIVE' },
            select: { id: true, walletBalance: true }
        });

        if (!user) {
            throw new Error("Active user not found");
        }

        // Preliminary balance check
        if (user.walletBalance < amount) {
            throw new Error("Insufficient funds");
        }

        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
        if (!STRIPE_SECRET_KEY) {
            throw new Error("Billing configuration error: secret missing");
        }

        // Simulate external payment gateway call
        const response = await fetch('https://api.stripe.com/v1/charges', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `amount=${amount}&currency=usd&source=tok_visa`
        });

        const paymentResult = await response.json() as any;

        if (paymentResult.status === 'succeeded') {
            // FIX: Atomic decrement with balance check to prevent negative balance race conditions
            const updateResult = await prisma.user.updateMany({
                where: { 
                    id: String(userId),
                    walletBalance: { gte: amount } 
                },
                data: {
                    walletBalance: { decrement: amount }
                }
            });

            if (updateResult.count === 0) {
                throw new Error("Insufficient funds during final processing");
            }

            // Fetch the updated user to return the new balance
            const updatedUser = await prisma.user.findFirst({
                where: { id: String(userId) },
                select: { walletBalance: true }
            });

            const newBalance = updatedUser?.walletBalance || 0;
            console.log(`[Payment] Success. New balance: ${newBalance}`);
            return { success: true, newBalance: newBalance };
        }

        return { success: false, reason: paymentResult.error?.message || "Payment declined" };

    } catch (error: any) {
        // Log generic failure without PII
        console.error(`[Payment] Fatal error processing request for User ${userId}:`, error.message);
        throw new Error("Payment processing failed");
    }
}