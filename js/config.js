/**
 * Floss Configuration
 *
 * Password Gate Settings (only for https:// mode)
 *
 * ⚠️ SECURITY WARNING:
 * This is NOT real security - it's a UX/access gate only!
 * - Client-side only (no server validation)
 * - Hash visible in source code
 * - Can be bypassed with browser DevTools
 * - Suitable for: Private demos, casual access control
 * - NOT suitable for: Confidential data, security-critical access
 */

export const CONFIG = {
    /**
     * Password Gate Configuration
     */
    passwordGate: {
        // Current password: "capy"
        // SHA-256 hash of password (lowercase, no salt for simplicity)
        passwordHash: "3acfb5bdbd33b642117c10e9f8555bc008d088a9d52de91f2364ce6da68e5832",

        /**
         * Session timeout in milliseconds
         * After this time, user must re-enter password
         *
         * Examples:
         * - 5 minutes: 300000
         * - 10 minutes: 600000
         * - 30 minutes: 1800000
         * - 1 hour: 3600000
         * - 24 hours: 86400000
         */
        sessionTimeout: 300000, // 5 minutes

        /**
         * Session storage key (internal, don't change)
         */
        sessionKey: 'floss-session-token'
    }
};

/**
 * Utility: Generate SHA-256 hash for a new password
 *
 * Usage in browser console:
 *
 *   import { hashPassword } from './js/config.js';
 *   const hash = await hashPassword('your-new-password');
 *   console.log(hash);
 *
 * Then copy the hash and update CONFIG.passwordGate.passwordHash above.
 */
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password.toLowerCase()); // Normalize to lowercase
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export default CONFIG;
