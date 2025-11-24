#!/bin/bash
# Build IIFE Bundle for file:// compatibility
# Concatenates all ES6 modules into a single IIFE bundle

OUTPUT="js/app-bundle-iife-auto.js"

echo "Building IIFE Bundle..."
echo "Output: $OUTPUT"

# Start bundle
cat > "$OUTPUT" << 'HEADER'
/**
 * Floss - Motion Design
 * IIFE Bundle for file:// compatibility
 * Auto-generated from ES6 modules
 */

(function(window) {
    'use strict';

    // =====================================================================
    // MODULE BUNDLE
    // =====================================================================

HEADER

# Utility modules (no dependencies)
echo "    // ===== VERSION =====" >> "$OUTPUT"
cat js/version.js | sed 's/^export const /const /' | sed 's/^export default /\/\/ /' >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "    // ===== UTILS: WebGL Check =====" >> "$OUTPUT"
cat js/utils/webgl-check.js | sed 's/^export function /function /' | sed 's/^export default.*//' >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "    // ===== UTILS: Storage =====" >> "$OUTPUT"
cat js/utils/storage.js | sed 's/^export function /function /' | sed 's/^export default.*//' >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "    // ===== UTILS: Text Texture =====" >> "$OUTPUT"
cat js/utils/text-texture.js | sed 's/^export function /function /' | sed 's/^export default.*//' >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "    // ===== UI: Icons =====" >> "$OUTPUT"
cat js/ui/icons.js | sed 's/^export function /function /' | sed 's/^export default //' | sed 's/^export const /const /' >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "    // ===== UI: Notification =====" >> "$OUTPUT"
cat js/ui/notification.js | sed 's/^export default //' >> "$OUTPUT"

# Core modules
echo "" >> "$OUTPUT"
echo "    // ===== CORE: State =====" >> "$OUTPUT"
cat js/core/state.js | sed 's/^export class /class /' | sed 's/^export default /const state = /' >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "    // ===== CORE: App Settings =====" >> "$OUTPUT"
cat js/core/app-settings.js | sed 's/^export default /const appSettings = /' >> "$OUTPUT"

# TODO: Add remaining core modules, effect modules, UI modules

# End bundle
cat >> "$OUTPUT" << 'FOOTER'

    // =====================================================================
    // EXPORT TO WINDOW
    // =====================================================================
    window.Floss = {
        VERSION,
        webglCheck: { isWebGLAvailable, getWebGLErrorMessage },
        storage: { getItem, setItem, removeItem, clear, isAvailable, getStorageInfo },
        textTexture: { createTextTexture, updateTextTexture },
        ICONS,
        getIcon,
        notification: new NotificationSystem(),
        state,
        appSettings
    };

    console.log('Floss IIFE Bundle loaded successfully');
    console.log('Available modules:', Object.keys(window.Floss));

})(window);
FOOTER

echo "✓ Bundle created: $OUTPUT"
echo "⚠ Note: This is a partial bundle. Full implementation requires all modules."
