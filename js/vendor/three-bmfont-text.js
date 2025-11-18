/**
 * three-bmfont-text ESM wrapper
 * Exports globally loaded threeBmfontText (from wzrd.in UMD bundle) as ES module
 *
 * The UMD script is loaded via <script> tag in index.html from wzrd.in
 * After first load, it's cached by Service Worker = Offline-First!
 *
 * wzrd.in standalone bundle exposes module as: window.threeBmfontText
 * The module is a factory function that creates geometry
 */

// Check if global is available
if (typeof window.threeBmfontText !== 'function') {
  console.error('threeBmfontText global not found. Script may not have loaded yet.',
    'Available globals:', Object.keys(window).filter(k => k.toLowerCase().includes('bmfont')));
}

// Export the module as default
// Note: threeBmfontText is the main export (factory function)
export default window.threeBmfontText;

// MSDFShader might be a property of the module
export const MSDFShader = window.threeBmfontText?.MSDFShader;
