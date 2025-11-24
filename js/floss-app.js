/**
 * Floss App - Shell Entry Point (ES Modules)
 *
 * This is a shell file that handles:
 * - App startup/initialization
 * - window.FlossApp global API
 * - Environment-specific wiring
 *
 * Core app logic lives in js/app.js - this file only handles startup.
 */

import App from './app.js';

/**
 * FlossApp Start API
 * Provides unified entry point for both online (ES modules) and offline (IIFE) modes
 */
window.FlossApp = {
    /**
     * Start the Floss application
     * @param {Object} config - Configuration object
     * @param {string} config.mode - 'online' | 'offline' (for logging/telemetry only)
     */
    start(config = {}) {
        const { mode = 'online' } = config;

        console.log(`🚀 Floss starting in ${mode} mode (ES modules)`);

        // Initialize app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new App();
                console.log(`✓ Floss app initialized (${mode} mode)`);
            });
        } else {
            new App();
            console.log(`✓ Floss app initialized (${mode} mode)`);
        }
    }
};
