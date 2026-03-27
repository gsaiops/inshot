import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 1. VULNERABILITY: Broken Access Control
 * Allows any user to change the password of ANY other user without verification.
 */
export async function adminResetPassword(targetUserId: string, newPasswordHash: string) {
    console.log("[Admin] Resetting password for user: " + targetUserId);
    
    // CRITICAL: No check to ensure the requester is an authorized admin.
    return prisma.user.update({
        where: { id: targetUserId },
        data: { passwordHash: newPasswordHash }
    });
}

/**
 * 2. VULNERABILITY: Resource Exhaustion (DoS)
 * A recursive function without a proper base case or depth limit.
 */
export async function buildUserOrgTree(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        include: { subordinates: true } 
    });

    if (!user) return null;

    // CRITICAL: Potential for infinite recursion if there is a circular dependency in the DB.
    // Also leads to memory exhaustion for large orgs.
    const tree = {
        name: user.name,
        subordinates: await Promise.all(
            user.subordinates.map(sub => buildUserOrgTree(sub.id))
        )
    };

    return tree;
}
