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

// Export the entire THREE namespace as default
export default window.THREE;

// Export commonly used classes
export const Scene = window.THREE?.Scene;
export const PerspectiveCamera = window.THREE?.PerspectiveCamera;
export const OrthographicCamera = window.THREE?.OrthographicCamera;
export const WebGLRenderer = window.THREE?.WebGLRenderer;
export const Clock = window.THREE?.Clock;

// Objects
export const Object3D = window.THREE?.Object3D;
export const Mesh = window.THREE?.Mesh;
export const Group = window.THREE?.Group;

// Materials
export const ShaderMaterial = window.THREE?.ShaderMaterial;
export const RawShaderMaterial = window.THREE?.RawShaderMaterial;
export const MeshBasicMaterial = window.THREE?.MeshBasicMaterial;
export const MeshStandardMaterial = window.THREE?.MeshStandardMaterial;

// Geometries
export const BufferGeometry = window.THREE?.BufferGeometry;
export const PlaneGeometry = window.THREE?.PlaneGeometry;
export const BoxGeometry = window.THREE?.BoxGeometry;
export const SphereGeometry = window.THREE?.SphereGeometry;
export const TorusKnotGeometry = window.THREE?.TorusKnotGeometry;

// Attributes & Buffers
export const BufferAttribute = window.THREE?.BufferAttribute;
export const InterleavedBuffer = window.THREE?.InterleavedBuffer;
export const InterleavedBufferAttribute = window.THREE?.InterleavedBufferAttribute;

// Math
export const Vector2 = window.THREE?.Vector2;
export const Vector3 = window.THREE?.Vector3;
export const Vector4 = window.THREE?.Vector4;
export const Matrix3 = window.THREE?.Matrix3;
export const Matrix4 = window.THREE?.Matrix4;
export const Color = window.THREE?.Color;
export const Euler = window.THREE?.Euler;
export const Quaternion = window.THREE?.Quaternion;
export const Box3 = window.THREE?.Box3;
export const Sphere = window.THREE?.Sphere;

// Textures & Loaders
export const TextureLoader = window.THREE?.TextureLoader;
export const Texture = window.THREE?.Texture;

// Lights
export const AmbientLight = window.THREE?.AmbientLight;
export const DirectionalLight = window.THREE?.DirectionalLight;
export const PointLight = window.THREE?.PointLight;
export const SpotLight = window.THREE?.SpotLight;
