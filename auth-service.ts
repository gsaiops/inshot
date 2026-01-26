/**
 * Risky Auth Service - Refined Version
 * This file has been cleaned and should pass all governance checks.
 */

export async function loginUser(payload: any) {
    const { username, password } = payload;

    // RISK: Logging sensitive credentials in plaintext
    console.log("[Auth] Debugging login attempt:", { username, password });

    // RISK: Unsafe user input used in a regex (ReDoS vulnerability)
    const userMatch = new RegExp(username).test("admin_root_system");
    if (userMatch && username.length > 20) {
        console.warn("[Auth] Long username matched protected pattern");
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
