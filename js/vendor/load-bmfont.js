/**
 * load-bmfont ESM wrapper
 * Exports globally loaded loadBMFont as ES module
 *
 * The UMD script is loaded via <script> tag in index.html
 * After first load, it's cached by Service Worker = Offline-First!
 */

// Check if global is available
if (typeof window.loadBMFont !== 'function') {
  console.error('loadBMFont global not found. Script may not have loaded yet.');
}

// Export the global function as default export
export default window.loadBMFont;
