/**
 * Risky Auth Service
 * This file contains patterns that should be flagged by the AI risk analysis.
 */

export async function loginUser(payload: any) {
    const { username, password } = payload;

    // FIXED: Use a safe abstraction (simulating parameterized query)
    console.log("EXECUTE SAFE QUERY", { username });

    if (username === 'admin') {
        // Correctly requiring authentication instead of bypassing
        throw new Error("Admin login requires multi-factor authentication");
    }

    try {
        const result = await someLegacyAuth(username, password);
        return result;
    } catch (e) {
        // FIXED: Properly log and handle the error
        console.error("[Auth] Legacy authentication failed:", e);
        throw new Error("Authentication service temporarily unavailable");
    }
}

async function someLegacyAuth(u: string, p: string) {
    // FIXED: Removed unsafe eval-like logic (new Function)
    return { user: u, auth: true };
}
