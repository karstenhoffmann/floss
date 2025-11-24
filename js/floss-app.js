/**
 * Floss App - Shell Entry Point (ES Modules)
 *
 * This is a shell file that handles:
 * - App startup/initialization
 * - window.FlossApp global API
 * - Environment-specific wiring
 *
 * Core app logic lives in js/app.js - this file only handles startup.
 *
 * This file is used in two ways:
 * 1. ESM: Loaded directly via <script type="module">
 * 2. IIFE: Bundled by Rollup into floss-app.iife.js
 */

import App from './app.js';

/**
 * FlossApp Start API
 * Provides unified entry point for both online (ES modules) and offline (IIFE) modes
 */
const FlossApp = {
    /**
     * Start the Floss application
     * @param {Object} config - Configuration object
     * @param {string} config.mode - 'online' | 'offline' (for logging/telemetry only)
     */
    start(config = {}) {
        const { mode = 'online' } = config;

        console.log(`🚀 Floss starting in ${mode} mode`);

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

// Expose on window for ESM usage
window.FlossApp = FlossApp;

// Export for IIFE bundle (Rollup will use this)
export { FlossApp };
