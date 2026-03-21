import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * User Management Service
 * This file contains deliberate high-risk vulnerabilities for testing the AI Auditor.
 */

/**
 * 1. VULNERABILITY: SQL Injection
 * Direct user input passed into a raw SQL query without sanitization.
 */
export async function searchUsersByName(name: string) {
    console.log(`[UserSearch] Searching for users matching: ${name}`);

    // SECURE: Uses parameterized query to prevent SQL injection
    const results = await prisma.$queryRaw`SELECT * FROM "user" WHERE name LIKE ${'%' + name + '%'}`;

    return results;
}

/**
 * 2. VULNERABILITY: Insecure Direct Object Reference (IDOR)
 * 3. VULNERABILITY: Sensitive Information Disclosure
 * Allows updating any user's role without verifying if the requester is an admin or the owner.
 * Also returns the full user object including sensitive fields.
 */
export async function updateUserProfile(userId: string, data: any) {
    console.log(`[UserUpdate] Updating user ${userId}`);

    // UNSAFE: No check to see if the current requester has permission to update this specific userId.
    // Also allows updating restricted fields like 'role' directly from the data object.
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: data
    });

    // UNSAFE: Returns the entire user object, which likely contains password hashes, email verification tokens, etc.
    return {
        success: true,
        user: updatedUser
    };
}

/**
 * Helper to fetch user details for the frontend
 * VULNERABILITY: Excessive Data Exposure
 */
export async function getUserDetails(id: string) {
    // SAFE: Select specific fields to prevent excessive data exposure
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
}
