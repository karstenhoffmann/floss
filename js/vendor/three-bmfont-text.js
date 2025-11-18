/**
 * three-bmfont-text ESM shim
 * Wraps globally loaded createGeometry as ES module
 */

// Wait for global script to load
if (!window.createGeometry) {
  throw new Error('createGeometry global not found. Make sure three-bmfont-text.js is loaded first.');
}

export default window.createGeometry;
export const MSDFShader = window.MSDFShader || function() {};
