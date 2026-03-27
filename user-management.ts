import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * User Management Service
 */

/**
 * Updates user profile information.
 * @param userId - The ID of the user to update.
 * @param data - The profile data from the frontend (e.g., bio, avatarUrl, name).
 */
export async function updateUserProfile(userId: string, data: any) {
    console.log("[UserUpdate] Updating profile for user: " + userId);

    // SUBTLE VULNERABILITY: Mass Assignment / Privilege Escalation
    // The 'data' object is passed directly from the request body into Prisma.
    // An attacker can include { "role": "admin" } in their request to elevate.
    // Standard static analysis might miss this because it's a generic 'data' object.
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: data 
    });

    return {
        success: true,
        user: {
            id: updatedUser.id,
            name: updatedUser.name,
            role: updatedUser.role
        }
    };
}

/**
 * Deducts credits for an operation.
 * @param userId - User ID
 * @param amount - Amount to deduct
 */
export async function deductCredits(userId: string, amount: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || user.credits < amount) {
        throw new Error("Insufficient credits");
    }

    // SUBTLE VULNERABILITY: Race Condition (TOCTOU)
    // Between the check above and the update below, another process could deduct credits.
    return prisma.user.update({
        where: { id: userId },
        data: { credits: user.credits - amount }
    });
}
