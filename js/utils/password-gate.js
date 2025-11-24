/**
 * Password Gate Utility
 *
 * Handles password validation and session management
 * Only used in online (https://) mode
 */

import { CONFIG } from '../config.js';

/**
 * Environment Detection
 */
export function isOnlineMode() {
    const protocol = window.location.protocol;
    return protocol === 'https:' || protocol === 'http:';
}

export function isOfflineMode() {
    return window.location.protocol === 'file:';
}

/**
 * Session Management
 */

/**
 * Check if user has a valid session
 * @returns {boolean} True if session is valid (within timeout)
 */
export function hasValidSession() {
    try {
        const sessionData = localStorage.getItem(CONFIG.passwordGate.sessionKey);
        if (!sessionData) return false;

        const { timestamp } = JSON.parse(sessionData);
        const now = Date.now();
        const elapsed = now - timestamp;

        // Check if session is still valid (within timeout)
        return elapsed < CONFIG.passwordGate.sessionTimeout;
    } catch (error) {
        console.error('Error checking session:', error);
        return false;
    }
}

/**
 * Create a new session (after successful password entry)
 */
export function createSession() {
    try {
        const sessionData = {
            timestamp: Date.now(),
            version: '1.0'
        };
        localStorage.setItem(CONFIG.passwordGate.sessionKey, JSON.stringify(sessionData));
        console.log('✓ Session created (expires in', CONFIG.passwordGate.sessionTimeout / 1000, 'seconds)');
    } catch (error) {
        console.error('Error creating session:', error);
    }
}

/**
 * Clear session (logout)
 */
export function clearSession() {
    try {
        localStorage.removeItem(CONFIG.passwordGate.sessionKey);
        console.log('✓ Session cleared');
    } catch (error) {
        console.error('Error clearing session:', error);
    }
}

/**
 * Password Validation
 */

/**
 * Hash a password using SHA-256
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hex string of hash
 */
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password.toLowerCase()); // Normalize to lowercase
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Validate password against stored hash
 * @param {string} password - Password to validate
 * @returns {Promise<boolean>} True if password matches
 */
export async function validatePassword(password) {
    try {
        const inputHash = await hashPassword(password);
        const isValid = inputHash === CONFIG.passwordGate.passwordHash;
        return isValid;
    } catch (error) {
        console.error('Error validating password:', error);
        return false;
    }
}

/**
 * Check if password gate should be shown
 * @returns {boolean} True if gate should be shown
 */
export function shouldShowPasswordGate() {
    // Only show in online mode
    if (!isOnlineMode()) {
        return false;
    }

    // Check if user has valid session
    if (hasValidSession()) {
        console.log('✓ Valid session found, skipping password gate');
        return false;
    }

    console.log('⚠ No valid session, showing password gate');
    return true;
}

export default {
    isOnlineMode,
    isOfflineMode,
    hasValidSession,
    createSession,
    clearSession,
    hashPassword,
    validatePassword,
    shouldShowPasswordGate
};
