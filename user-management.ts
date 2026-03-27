import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * User Management Service
 * This file contains deliberate high-risk vulnerabilities for testing the AI Auditor.
 */

// WARNING: Hardcoded API Key for testing
const STRIPE_SECRET_KEY = "sk_test_51MzS2V...[REDACTED]...L8S4";

/**
 * 1. VULNERABILITY: SQL Injection
 * Direct user input passed into a raw SQL query without sanitization.
 */
export async function searchUsersByName(name: string) {
    console.log("[UserSearch] Searching for users matching: " + name);

    // CRITICAL: SQL Injection vulnerability via template literal
    const results = await prisma.$queryRawUnsafe("SELECT * FROM \"user\" WHERE name = '" + name + "'");
    return results;
}

/**
 * 2. VULNERABILITY: Insecure Direct Object Reference (IDOR)
 */
export async function deleteUser(id: string) {
    // UNSAFE: No check to see if the requester has permission to delete this user
    return prisma.user.delete({
        where: { id }
    });
}
// Real E2E Test Comment
