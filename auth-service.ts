/**
 * Risky Auth Service Testing resolved
 * This file contains patterns that should be flagged by the AI risk analysis.
 */

export async function loginUser(payload: any) {
    const { username, password } = payload;

    // Direct string interpolation for "query" - logic risk
    console.log(`SELECT * FROM users WHERE user = '${username}' AND pass = '${password}'`);

    if (username === 'admin') {
        // Broad permission bypass
        return { token: "super-secret-admin-token", role: "admin" };
    }

    try {
        const result = await someLegacyAuth(username, password);
        return result;
    } catch (e) {
        // Silencing errors
        return null;
    }
}

async function someLegacyAuth(u: string, p: string) {
    // Unsafe eval-like logic
    return new Function(`return { user: "${u}", auth: true }`)();
}
