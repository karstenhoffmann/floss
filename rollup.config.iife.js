/**
 * Rollup Configuration for IIFE Build of canvas-record
 *
 * Creates a single-file IIFE bundle for file:// compatibility
 * Exposes: window.CanvasRecord = { Recorder, Encoders, ... }
 *
 * This bundle includes ALL dependencies inline:
 * - canvas-record source code
 * - canvas-context
 * - canvas-screenshot
 * - media-codecs
 * - mediabunny (with Node polyfills)
 * - h264-mp4-encoder (references existing UMD bundle)
 *
 * Output: lib/canvas-record/canvas-record.iife.js (~2-3 MB)
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default {
    input: 'lib/canvas-record/package/index.js',

    output: {
        file: 'lib/canvas-record/canvas-record.iife.js',
        format: 'iife',
        name: 'CanvasRecord',  // Exposes as window.CanvasRecord
        sourcemap: false,
        globals: {
            // h264-mp4-encoder is loaded separately as UMD bundle
            'h264-mp4-encoder': 'H264MP4Encoder'
        }
    },

    external: [
        // h264-mp4-encoder is already available as UMD bundle
        // Will be loaded via separate <script> tag
        'h264-mp4-encoder',

        // gifenc and @ffmpeg/* are optional (CDN-only, not needed for basic MP4 export)
        'gifenc',
        '@ffmpeg/ffmpeg',
        '@ffmpeg/util'
    ],

    plugins: [
        // Resolve all node_modules dependencies
        resolve({
            browser: true,
            preferBuiltins: false
        }),

        // Convert CommonJS modules to ES6
        commonjs(),

        // Add Node.js polyfills (required for mediabunny)
        nodePolyfills(),

        // Minify output (optional - comment out for debugging)
        // terser()
    ]
};
