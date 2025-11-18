/**
 * THREE.js ESM wrapper
 * Exports globally loaded THREE (from UMD bundle) as ES module
 *
 * The UMD script (three.min.js) is loaded via <script> tag in index.html
 * and sets window.THREE as a global. This wrapper exports it for ESM imports.
 */

// Check if global is available
if (typeof window.THREE === 'undefined') {
  console.error('THREE global not found. Script may not have loaded yet.');
}

// Export the global THREE object and all its properties
export default window.THREE;
export const Scene = window.THREE?.Scene;
export const PerspectiveCamera = window.THREE?.PerspectiveCamera;
export const WebGLRenderer = window.THREE?.WebGLRenderer;
export const Mesh = window.THREE?.Mesh;
export const ShaderMaterial = window.THREE?.ShaderMaterial;
export const BufferGeometry = window.THREE?.BufferGeometry;
export const TextureLoader = window.THREE?.TextureLoader;
export const Vector2 = window.THREE?.Vector2;
export const Color = window.THREE?.Color;

// Export everything from THREE for convenience
// This allows: import * as THREE from 'three'
if (window.THREE) {
  for (const key in window.THREE) {
    if (window.THREE.hasOwnProperty(key)) {
      // Dynamically export all THREE properties
      // Note: This doesn't work in strict ESM, but the named exports above cover common cases
    }
  }
}
