import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * User Management Service
 */

/**
 * Updates user profile information.
 * FIXED: Uses an explicit field whitelist to prevent Mass Assignment.
 * @param userId - The ID of the user to update.
 * @param data - The profile data from the frontend.
 */
export async function updateUserProfile(userId: string, data: any) {
    console.log("[UserUpdate] Updating profile for user: " + userId);

    // SECURE: Only allow updates to specific, safe fields.
    const { bio, avatarUrl, name } = data;
    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (name !== undefined) updateData.name = name;

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
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
 * FIXED: Uses Prisma's atomic decrement to prevent race conditions (TOCTOU).
 * @param userId - User ID
 * @param amount - Amount to deduct
 */
export async function deductCredits(userId: string, amount: number) {
    return prisma.user.update({
        where: {
            id: userId,
            credits: { gte: amount } // Check balance atomically
        },
        data: {
            credits: { decrement: amount } // Update atomically
        }
    });
}
