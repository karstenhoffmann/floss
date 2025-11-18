/**
 * three-bmfont-text ESM wrapper
 * Exports globally loaded three-bmfont-text as ES module
 *
 * The UMD script is loaded via <script> tag in index.html
 * After first load, it's cached by Service Worker = Offline-First!
 */

// Check if globals are available
if (typeof window.createGeometry !== 'function') {
  console.error('createGeometry global not found. Script may not have loaded yet.');
}

if (typeof window.MSDFShader !== 'function') {
  console.error('MSDFShader global not found. Script may not have loaded yet.');
}

// Export the globals
export default window.createGeometry;
export const MSDFShader = window.MSDFShader;
