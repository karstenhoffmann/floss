/**
 * load-bmfont ESM shim
 * Wraps globally loaded loadBMFont as ES module
 */

// Wait for global script to load
if (!window.loadBMFont) {
  throw new Error('loadBMFont global not found. Make sure browser.js is loaded first.');
}

export default window.loadBMFont;
