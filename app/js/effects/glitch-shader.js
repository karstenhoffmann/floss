/**
 * Glitch Shader for Post-Processing
 * Creates VHS/digital glitch effects with RGB split, scanlines, and noise
 */

export const GlitchShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uGlitchIntensity: { value: 0.5 },
        uRGBShift: { value: 0.003 },
        uScanlines: { value: 1.0 },
        uNoiseIntensity: { value: 0.1 },
        uBlockSize: { value: 0.05 },
        uDistortion: { value: 0.1 }
    },

    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uGlitchIntensity;
        uniform float uRGBShift;
        uniform float uScanlines;
        uniform float uNoiseIntensity;
        uniform float uBlockSize;
        uniform float uDistortion;

        varying vec2 vUv;

        // Random noise function
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        // 2D noise
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
            vec2 uv = vUv;

            // Block displacement glitch
            float blockNoise = noise(vec2(floor(uv.y / uBlockSize) * uBlockSize, uTime * 0.5));
            float glitchLine = step(0.5 + uGlitchIntensity * 0.3, blockNoise);

            // Horizontal displacement on glitch lines
            float displacement = (random(vec2(floor(uv.y / uBlockSize), uTime)) - 0.5) * uDistortion * glitchLine;
            uv.x += displacement * uGlitchIntensity;

            // Clamp UV to prevent wrapping
            uv.x = clamp(uv.x, 0.0, 1.0);

            // RGB shift (chromatic aberration)
            float shift = uRGBShift * uGlitchIntensity;
            vec2 uvR = uv + vec2(shift, 0.0);
            vec2 uvG = uv;
            vec2 uvB = uv - vec2(shift, 0.0);

            // Clamp RGB UVs
            uvR.x = clamp(uvR.x, 0.0, 1.0);
            uvB.x = clamp(uvB.x, 0.0, 1.0);

            // Sample texture with RGB split
            float r = texture2D(tDiffuse, uvR).r;
            float g = texture2D(tDiffuse, uvG).g;
            float b = texture2D(tDiffuse, uvB).b;

            vec3 color = vec3(r, g, b);

            // Scanlines
            float scanline = sin(vUv.y * 800.0 + uTime * 10.0) * 0.04 * uScanlines;
            color -= scanline;

            // Digital noise
            float noiseValue = random(vUv * uTime * 0.0001) * uNoiseIntensity;
            color += noiseValue;

            // Random full-screen glitches (occasional)
            float randomGlitch = step(0.998, random(vec2(uTime * 0.001, 0.0)));
            color = mix(color, vec3(random(vUv + uTime)), randomGlitch * uGlitchIntensity);

            gl_FragColor = vec4(color, 1.0);
        }
    `
};

export default GlitchShader;
