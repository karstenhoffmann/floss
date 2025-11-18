/**
 * load-bmfont ESM wrapper
 * Exports globally loaded loadBmfont (from wzrd.in UMD bundle) as ES module
 *
 * The UMD script is loaded via <script> tag in index.html from wzrd.in
 * After first load, it's cached by Service Worker = Offline-First!
 */

// wzrd.in standalone bundles expose the module as camelCase global
// load-bmfont → loadBmfont
const loadBmfont = window.loadBmfont || window.loadBMFont;

// Check if global is available
if (typeof loadBmfont !== 'function') {
  console.error('loadBmfont global not found. Script may not have loaded yet.',
    'Available globals:', Object.keys(window).filter(k => k.toLowerCase().includes('bmfont')));
}

// Export the global function as default export
export default loadBmfont;
