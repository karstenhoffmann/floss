/**
 * Rollup Configuration for Bundling canvas-record Dependencies
 *
 * This config bundles ES modules with internal dependencies into single-file
 * bundles for offline/file:// usage.
 *
 * Target Modules:
 * - canvas-context (utils)
 * - canvas-screenshot (utils)
 * - media-codecs (codec detection)
 * - mediabunny (video encoding - needs Node polyfills)
 *
 * Note: h264-mp4-encoder uses pre-built web bundle (not bundled here)
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default [
    // 1. canvas-context (~10 KB)
    {
        input: 'node_modules/canvas-context/index.js',
        output: {
            file: 'lib/esm/bundles/canvas-context.js',
            format: 'esm',
            sourcemap: false
        },
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs()
        ]
    },

    // 2. canvas-screenshot (~15 KB)
    {
        input: 'node_modules/canvas-screenshot/index.js',
        output: {
            file: 'lib/esm/bundles/canvas-screenshot.js',
            format: 'esm',
            sourcemap: false
        },
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs()
        ]
    },

    // 3. media-codecs (~25 KB)
    {
        input: 'node_modules/media-codecs/index.js',
        output: {
            file: 'lib/esm/bundles/media-codecs.js',
            format: 'esm',
            sourcemap: false
        },
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs()
        ]
    },

    // 4. mediabunny (~60 KB with Node polyfills)
    {
        input: 'node_modules/mediabunny/dist/modules/src/index.js',
        output: {
            file: 'lib/esm/bundles/mediabunny.js',
            format: 'esm',
            sourcemap: false
        },
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs(),
            nodePolyfills() // Required: mediabunny uses Stream, Buffer, etc.
        ]
    }
];
