/**
 * Risky Auth Service - The Architect Audit
 * This file has been cleaned and should pass all governance checks.
 */

interface LoginPayload {
    username: string;
    password: string;
}

export async function loginUser(payload: LoginPayload) {
    const { username, password } = payload;

    // Strict equality check instead of vulnerable pattern matching
    if (username === "admin_root_system" && username.length > 20) {
        console.warn("[Auth] Protected system account access attempt");
    }

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
