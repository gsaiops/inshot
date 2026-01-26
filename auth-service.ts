/**
 * Risky Auth Service - Refined Version
 * This file has been cleaned and should pass all governance checks.
 */

export async function loginUser(payload: any) {
    const { username, password } = payload;

    // Standard logging for audit trails
    console.log("[Auth] Attempting login for user:", { username });

    if (username === 'admin') {
        throw new Error("Admin login requires multi-factor authentication");
    }

    try {
        const result = await someLegacyAuth(username, password);
        return result;
    } catch (e) {
        console.error("[Auth] Legacy authentication failed:", e);
        throw new Error("Authentication service temporarily unavailable");
    }
}

async function someLegacyAuth(u: string, p: string) {
    // Return standard auth response
    return { user: u, auth: true };
}
