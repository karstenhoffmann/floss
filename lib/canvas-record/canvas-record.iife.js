var CanvasRecord = (function (exports, HME, gifenc, ffmpeg, util) {
	'use strict';

	var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
	function _interopNamespaceDefault(e) {
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		}
		n.default = e;
		return Object.freeze(n);
	}

	var gifenc__namespace = /*#__PURE__*/_interopNamespaceDefault(gifenc);

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var fileExtension$1 = {exports: {}};

	/*! file-extension v4.0.5 | (c) silverwind | BSD license */

	var hasRequiredFileExtension;

	function requireFileExtension () {
		if (hasRequiredFileExtension) return fileExtension$1.exports;
		hasRequiredFileExtension = 1;
		(function (module, exports$1) {

			(function(m) {
			  {
			    module.exports = m();
			  }
			})(function() {
			  return function fileExtension(filename, opts) {
			    if (!opts) opts = {};
			    if (!filename) return "";
			    var ext = (/[^./\\]*$/.exec(filename) || [""])[0];
			    return opts.preserveCase ? ext : ext.toLowerCase();
			  };
			}); 
		} (fileExtension$1));
		return fileExtension$1.exports;
	}

	var fileExtensionExports = requireFileExtension();
	var fileExtension = /*@__PURE__*/getDefaultExportFromCjs(fileExtensionExports);

	/** @module canvasScreenshot */


	/**
	 * Get the MIME type
	 *
	 * @private
	 * @param {string} filename
	 * @returns {string}
	 */
	function getType(filename) {
	  const ext = filename.includes(".") && fileExtension(filename);
	  return `image/${ext === "jpg" ? "jpeg" : ext || "png"}`;
	}

	/**
	 * Download in browser using a DOM link
	 *
	 * @private
	 * @param {string} filename
	 * @param {string} url
	 */
	function downloadURL(filename, url) {
	  const link = document.createElement("a");
	  link.download = filename;
	  link.href = url;
	  const event = new MouseEvent("click");
	  link.dispatchEvent(event);
	}

	/**
	 * Take a screenshot.
	 * Setting `options.useBlob` to `true` will consequently make the module async and return the latter.
	 * @alias module:canvasScreenshot
	 * @param {HTMLCanvasElement} canvas The canvas element
	 * @param {import("./types.js").CanvasScreenshotOptions} [options={}]
	 * @returns {string | Promise<Blob>} A `DOMString` or a `Promise` resolving with a `Blob`.
	 *
	 * Type is inferred from the filename extension:
	 * - png for `"image/png"` (default)
	 * - jpg/jpeg for `"image/jpeg"`
	 * - webp for `"image/webp"`
	 */
	function canvasScreenshot(canvas, options = {}) {
	  const date = new Date();

	  const {
	    filename = `Screen Shot ${date.toISOString().slice(0, 10)} at ${date
      .toTimeString()
      .slice(0, 8)
      .replace(/:/g, ".")}.png`,
	    type = getType(filename),
	    quality = 1,
	    useBlob,
	    download = true,
	  } = {
	    ...options,
	  };

	  if (useBlob) {
	    return new Promise((resolve) => {
	      canvas.toBlob(
	        (blob) => {
	          if (download) {
	            const url = URL.createObjectURL(blob);
	            downloadURL(filename, url);

	            setTimeout(() => {
	              URL.revokeObjectURL(url);
	            }, 1);
	          }

	          resolve(blob);
	        },
	        type,
	        quality,
	      );
	    });
	  }

	  const dataURL = canvas.toDataURL(type, quality);

	  if (download) downloadURL(filename, dataURL);

	  return dataURL;
	}

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	function assert(x) {
	    if (!x) {
	        throw new Error('Assertion failed.');
	    }
	}
	const normalizeRotation = (rotation) => {
	    const mappedRotation = (rotation % 360 + 360) % 360;
	    if (mappedRotation === 0 || mappedRotation === 90 || mappedRotation === 180 || mappedRotation === 270) {
	        return mappedRotation;
	    }
	    else {
	        throw new Error(`Invalid rotation ${rotation}.`);
	    }
	};
	const last = (arr) => {
	    return arr && arr[arr.length - 1];
	};
	const isU32 = (value) => {
	    return value >= 0 && value < 2 ** 32;
	};
	class Bitstream {
	    constructor(bytes) {
	        this.bytes = bytes;
	        /** Current offset in bits. */
	        this.pos = 0;
	    }
	    seekToByte(byteOffset) {
	        this.pos = 8 * byteOffset;
	    }
	    readBit() {
	        const byteIndex = Math.floor(this.pos / 8);
	        const byte = this.bytes[byteIndex] ?? 0;
	        const bitIndex = 0b111 - (this.pos & 0b111);
	        const bit = (byte & (1 << bitIndex)) >> bitIndex;
	        this.pos++;
	        return bit;
	    }
	    readBits(n) {
	        if (n === 1) {
	            return this.readBit();
	        }
	        let result = 0;
	        for (let i = 0; i < n; i++) {
	            result <<= 1;
	            result |= this.readBit();
	        }
	        return result;
	    }
	    writeBits(n, value) {
	        const end = this.pos + n;
	        for (let i = this.pos; i < end; i++) {
	            const byteIndex = Math.floor(i / 8);
	            let byte = this.bytes[byteIndex];
	            const bitIndex = 0b111 - (i & 0b111);
	            byte &= ~(1 << bitIndex);
	            byte |= ((value & (1 << (end - i - 1))) >> (end - i - 1)) << bitIndex;
	            this.bytes[byteIndex] = byte;
	        }
	        this.pos = end;
	    }
	    ;
	    readAlignedByte() {
	        // Ensure we're byte-aligned
	        if (this.pos % 8 !== 0) {
	            throw new Error('Bitstream is not byte-aligned.');
	        }
	        const byteIndex = this.pos / 8;
	        const byte = this.bytes[byteIndex] ?? 0;
	        this.pos += 8;
	        return byte;
	    }
	    skipBits(n) {
	        this.pos += n;
	    }
	    getBitsLeft() {
	        return this.bytes.length * 8 - this.pos;
	    }
	    clone() {
	        const clone = new Bitstream(this.bytes);
	        clone.pos = this.pos;
	        return clone;
	    }
	}
	/** Reads an exponential-Golomb universal code from a Bitstream.  */
	const readExpGolomb = (bitstream) => {
	    let leadingZeroBits = 0;
	    while (bitstream.readBits(1) === 0 && leadingZeroBits < 32) {
	        leadingZeroBits++;
	    }
	    if (leadingZeroBits >= 32) {
	        throw new Error('Invalid exponential-Golomb code.');
	    }
	    const result = (1 << leadingZeroBits) - 1 + bitstream.readBits(leadingZeroBits);
	    return result;
	};
	/** Reads a signed exponential-Golomb universal code from a Bitstream. */
	const readSignedExpGolomb = (bitstream) => {
	    const codeNum = readExpGolomb(bitstream);
	    return ((codeNum & 1) === 0)
	        ? -(codeNum >> 1)
	        : ((codeNum + 1) >> 1);
	};
	const writeBits = (bytes, start, end, value) => {
	    for (let i = start; i < end; i++) {
	        const byteIndex = Math.floor(i / 8);
	        let byte = bytes[byteIndex];
	        const bitIndex = 0b111 - (i & 0b111);
	        byte &= ~(1 << bitIndex);
	        byte |= ((value & (1 << (end - i - 1))) >> (end - i - 1)) << bitIndex;
	        bytes[byteIndex] = byte;
	    }
	};
	const toUint8Array = (source) => {
	    if (source.constructor === Uint8Array) { // We want a true Uint8Array, not something that extends it like Buffer
	        return source;
	    }
	    else if (source instanceof ArrayBuffer) {
	        return new Uint8Array(source);
	    }
	    else {
	        return new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
	    }
	};
	const toDataView = (source) => {
	    if (source.constructor === DataView) {
	        return source;
	    }
	    else if (source instanceof ArrayBuffer) {
	        return new DataView(source);
	    }
	    else {
	        return new DataView(source.buffer, source.byteOffset, source.byteLength);
	    }
	};
	new TextDecoder();
	const textEncoder = new TextEncoder();
	const invertObject = (object) => {
	    return Object.fromEntries(Object.entries(object).map(([key, value]) => [value, key]));
	};
	// For the color space mappings, see Rec. ITU-T H.273.
	const COLOR_PRIMARIES_MAP = {
	    bt709: 1, // ITU-R BT.709
	    bt470bg: 5, // ITU-R BT.470BG
	    smpte170m: 6, // ITU-R BT.601 525 - SMPTE 170M
	    bt2020: 9, // ITU-R BT.202
	    smpte432: 12, // SMPTE EG 432-1
	};
	invertObject(COLOR_PRIMARIES_MAP);
	const TRANSFER_CHARACTERISTICS_MAP = {
	    'bt709': 1, // ITU-R BT.709
	    'smpte170m': 6, // SMPTE 170M
	    'linear': 8, // Linear transfer characteristics
	    'iec61966-2-1': 13, // IEC 61966-2-1
	    'pq': 16, // Rec. ITU-R BT.2100-2 perceptual quantization (PQ) system
	    'hlg': 18, // Rec. ITU-R BT.2100-2 hybrid loggamma (HLG) system
	};
	invertObject(TRANSFER_CHARACTERISTICS_MAP);
	const MATRIX_COEFFICIENTS_MAP = {
	    'rgb': 0, // Identity
	    'bt709': 1, // ITU-R BT.709
	    'bt470bg': 5, // ITU-R BT.470BG
	    'smpte170m': 6, // SMPTE 170M
	    'bt2020-ncl': 9, // ITU-R BT.2020-2 (non-constant luminance)
	};
	invertObject(MATRIX_COEFFICIENTS_MAP);
	const colorSpaceIsComplete = (colorSpace) => {
	    return (!!colorSpace
	        && !!colorSpace.primaries
	        && !!colorSpace.transfer
	        && !!colorSpace.matrix
	        && colorSpace.fullRange !== undefined);
	};
	const isAllowSharedBufferSource = (x) => {
	    return (x instanceof ArrayBuffer
	        || (typeof SharedArrayBuffer !== 'undefined' && x instanceof SharedArrayBuffer)
	        || ArrayBuffer.isView(x));
	};
	class AsyncMutex {
	    constructor() {
	        this.currentPromise = Promise.resolve();
	    }
	    async acquire() {
	        let resolver;
	        const nextPromise = new Promise((resolve) => {
	            resolver = resolve;
	        });
	        const currentPromiseAlias = this.currentPromise;
	        this.currentPromise = nextPromise;
	        await currentPromiseAlias;
	        return resolver;
	    }
	}
	const promiseWithResolvers = () => {
	    let resolve;
	    let reject;
	    const promise = new Promise((res, rej) => {
	        resolve = res;
	        reject = rej;
	    });
	    return { promise, resolve: resolve, reject: reject };
	};
	const assertNever = (x) => {
	    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	    throw new Error(`Unexpected value: ${x}`);
	};
	const UNDETERMINED_LANGUAGE = 'und';
	const roundToMultiple = (value, multiple) => {
	    return Math.round(value / multiple) * multiple;
	};
	const ISO_639_2_REGEX = /^[a-z]{3}$/;
	const isIso639Dash2LanguageCode = (x) => {
	    return ISO_639_2_REGEX.test(x);
	};
	// Since the result will be truncated, add a bit of eps to compensate for floating point errors
	const SECOND_TO_MICROSECOND_FACTOR = 1e6 * (1 + Number.EPSILON);
	const computeRationalApproximation = (x, maxDenominator) => {
	    // Handle negative numbers
	    const sign = x < 0 ? -1 : 1;
	    x = Math.abs(x);
	    let prevNumerator = 0, prevDenominator = 1;
	    let currNumerator = 1, currDenominator = 0;
	    // Continued fraction algorithm
	    let remainder = x;
	    while (true) {
	        const integer = Math.floor(remainder);
	        // Calculate next convergent
	        const nextNumerator = integer * currNumerator + prevNumerator;
	        const nextDenominator = integer * currDenominator + prevDenominator;
	        if (nextDenominator > maxDenominator) {
	            return {
	                numerator: sign * currNumerator,
	                denominator: currDenominator,
	            };
	        }
	        prevNumerator = currNumerator;
	        prevDenominator = currDenominator;
	        currNumerator = nextNumerator;
	        currDenominator = nextDenominator;
	        remainder = 1 / (remainder - integer);
	        // Guard against precision issues
	        if (!isFinite(remainder)) {
	            break;
	        }
	    }
	    return {
	        numerator: sign * currNumerator,
	        denominator: currDenominator,
	    };
	};
	const keyValueIterator = function* (object) {
	    for (const key in object) {
	        const value = object[key];
	        if (value === undefined) {
	            continue;
	        }
	        yield { key, value };
	    }
	};
	const imageMimeTypeToExtension = (mimeType) => {
	    switch (mimeType.toLowerCase()) {
	        case 'image/jpeg':
	        case 'image/jpg':
	            return '.jpg';
	        case 'image/png':
	            return '.png';
	        case 'image/gif':
	            return '.gif';
	        case 'image/webp':
	            return '.webp';
	        case 'image/bmp':
	            return '.bmp';
	        case 'image/svg+xml':
	            return '.svg';
	        case 'image/tiff':
	            return '.tiff';
	        case 'image/avif':
	            return '.avif';
	        case 'image/x-icon':
	        case 'image/vnd.microsoft.icon':
	            return '.ico';
	        default:
	            return null;
	    }
	};
	const uint8ArraysAreEqual = (a, b) => {
	    if (a.length !== b.length) {
	        return false;
	    }
	    for (let i = 0; i < a.length; i++) {
	        if (a[i] !== b[i]) {
	            return false;
	        }
	    }
	    return true;
	};

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	/**
	 * Image data with additional metadata.
	 *
	 * @group Metadata tags
	 * @public
	 */
	class RichImageData {
	    /** Creates a new {@link RichImageData}. */
	    constructor(
	    /** The raw image data. */
	    data, 
	    /** An RFC 6838 MIME type (e.g. image/jpeg, image/png, etc.) */
	    mimeType) {
	        this.data = data;
	        this.mimeType = mimeType;
	        if (!(data instanceof Uint8Array)) {
	            throw new TypeError('data must be a Uint8Array.');
	        }
	        if (typeof mimeType !== 'string') {
	            throw new TypeError('mimeType must be a string.');
	        }
	    }
	}
	/**
	 * A file attached to a media file.
	 *
	 * @group Metadata tags
	 * @public
	 */
	class AttachedFile {
	    /** Creates a new {@link AttachedFile}. */
	    constructor(
	    /** The raw file data. */
	    data, 
	    /** An RFC 6838 MIME type (e.g. image/jpeg, image/png, font/ttf, etc.) */
	    mimeType, 
	    /** The name of the file. */
	    name, 
	    /** A description of the file. */
	    description) {
	        this.data = data;
	        this.mimeType = mimeType;
	        this.name = name;
	        this.description = description;
	        if (!(data instanceof Uint8Array)) {
	            throw new TypeError('data must be a Uint8Array.');
	        }
	        if (mimeType !== undefined && typeof mimeType !== 'string') {
	            throw new TypeError('mimeType, when provided, must be a string.');
	        }
	        if (name !== undefined && typeof name !== 'string') {
	            throw new TypeError('name, when provided, must be a string.');
	        }
	        if (description !== undefined && typeof description !== 'string') {
	            throw new TypeError('description, when provided, must be a string.');
	        }
	    }
	}
	const validateMetadataTags = (tags) => {
	    if (!tags || typeof tags !== 'object') {
	        throw new TypeError('tags must be an object.');
	    }
	    if (tags.title !== undefined && typeof tags.title !== 'string') {
	        throw new TypeError('tags.title, when provided, must be a string.');
	    }
	    if (tags.description !== undefined && typeof tags.description !== 'string') {
	        throw new TypeError('tags.description, when provided, must be a string.');
	    }
	    if (tags.artist !== undefined && typeof tags.artist !== 'string') {
	        throw new TypeError('tags.artist, when provided, must be a string.');
	    }
	    if (tags.album !== undefined && typeof tags.album !== 'string') {
	        throw new TypeError('tags.album, when provided, must be a string.');
	    }
	    if (tags.albumArtist !== undefined && typeof tags.albumArtist !== 'string') {
	        throw new TypeError('tags.albumArtist, when provided, must be a string.');
	    }
	    if (tags.trackNumber !== undefined && (!Number.isInteger(tags.trackNumber) || tags.trackNumber <= 0)) {
	        throw new TypeError('tags.trackNumber, when provided, must be a positive integer.');
	    }
	    if (tags.tracksTotal !== undefined
	        && (!Number.isInteger(tags.tracksTotal) || tags.tracksTotal <= 0)) {
	        throw new TypeError('tags.tracksTotal, when provided, must be a positive integer.');
	    }
	    if (tags.discNumber !== undefined && (!Number.isInteger(tags.discNumber) || tags.discNumber <= 0)) {
	        throw new TypeError('tags.discNumber, when provided, must be a positive integer.');
	    }
	    if (tags.discsTotal !== undefined
	        && (!Number.isInteger(tags.discsTotal) || tags.discsTotal <= 0)) {
	        throw new TypeError('tags.discsTotal, when provided, must be a positive integer.');
	    }
	    if (tags.genre !== undefined && typeof tags.genre !== 'string') {
	        throw new TypeError('tags.genre, when provided, must be a string.');
	    }
	    if (tags.date !== undefined && (!(tags.date instanceof Date) || Number.isNaN(tags.date.getTime()))) {
	        throw new TypeError('tags.date, when provided, must be a valid Date.');
	    }
	    if (tags.lyrics !== undefined && typeof tags.lyrics !== 'string') {
	        throw new TypeError('tags.lyrics, when provided, must be a string.');
	    }
	    if (tags.images !== undefined) {
	        if (!Array.isArray(tags.images)) {
	            throw new TypeError('tags.images, when provided, must be an array.');
	        }
	        for (const image of tags.images) {
	            if (!image || typeof image !== 'object') {
	                throw new TypeError('Each image in tags.images must be an object.');
	            }
	            if (!(image.data instanceof Uint8Array)) {
	                throw new TypeError('Each image.data must be a Uint8Array.');
	            }
	            if (typeof image.mimeType !== 'string') {
	                throw new TypeError('Each image.mimeType must be a string.');
	            }
	            if (!['coverFront', 'coverBack', 'unknown'].includes(image.kind)) {
	                throw new TypeError('Each image.kind must be \'coverFront\', \'coverBack\', or \'unknown\'.');
	            }
	        }
	    }
	    if (tags.comment !== undefined && typeof tags.comment !== 'string') {
	        throw new TypeError('tags.comment, when provided, must be a string.');
	    }
	    if (tags.raw !== undefined) {
	        if (!tags.raw || typeof tags.raw !== 'object') {
	            throw new TypeError('tags.raw, when provided, must be an object.');
	        }
	        for (const value of Object.values(tags.raw)) {
	            if (value !== null
	                && typeof value !== 'string'
	                && !(value instanceof Uint8Array)
	                && !(value instanceof RichImageData)
	                && !(value instanceof AttachedFile)) {
	                throw new TypeError('Each value in tags.raw must be a string, Uint8Array, RichImageData, AttachedFile, or null.');
	            }
	        }
	    }
	};

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	/**
	 * List of known video codecs, ordered by encoding preference.
	 * @group Codecs
	 * @public
	 */
	const VIDEO_CODECS = [
	    'avc',
	    'hevc',
	    'vp9',
	    'av1',
	    'vp8',
	];
	/**
	 * List of known PCM (uncompressed) audio codecs, ordered by encoding preference.
	 * @group Codecs
	 * @public
	 */
	const PCM_AUDIO_CODECS = [
	    'pcm-s16', // We don't prefix 'le' so we're compatible with the WebCodecs-registered PCM codec strings
	    'pcm-s16be',
	    'pcm-s24',
	    'pcm-s24be',
	    'pcm-s32',
	    'pcm-s32be',
	    'pcm-f32',
	    'pcm-f32be',
	    'pcm-f64',
	    'pcm-f64be',
	    'pcm-u8',
	    'pcm-s8',
	    'ulaw',
	    'alaw',
	];
	/**
	 * List of known compressed audio codecs, ordered by encoding preference.
	 * @group Codecs
	 * @public
	 */
	const NON_PCM_AUDIO_CODECS = [
	    'aac',
	    'opus',
	    'mp3',
	    'vorbis',
	    'flac',
	];
	/**
	 * List of known audio codecs, ordered by encoding preference.
	 * @group Codecs
	 * @public
	 */
	const AUDIO_CODECS = [
	    ...NON_PCM_AUDIO_CODECS,
	    ...PCM_AUDIO_CODECS,
	];
	/**
	 * List of known subtitle codecs, ordered by encoding preference.
	 * @group Codecs
	 * @public
	 */
	const SUBTITLE_CODECS = [
	    'webvtt',
	]; // TODO add the rest
	const generateVp9CodecConfigurationFromCodecString = (codecString) => {
	    // Reference: https://www.webmproject.org/docs/container/#vp9-codec-feature-metadata-codecprivate
	    const parts = codecString.split('.'); // We can derive the required values from the codec string
	    const profile = Number(parts[1]);
	    const level = Number(parts[2]);
	    const bitDepth = Number(parts[3]);
	    const chromaSubsampling = parts[4] ? Number(parts[4]) : 1;
	    return [
	        1, 1, profile,
	        2, 1, level,
	        3, 1, bitDepth,
	        4, 1, chromaSubsampling,
	    ];
	};
	const generateAv1CodecConfigurationFromCodecString = (codecString) => {
	    // Reference: https://aomediacodec.github.io/av1-isobmff/
	    const parts = codecString.split('.'); // We can derive the required values from the codec string
	    const marker = 1;
	    const version = 1;
	    const firstByte = (marker << 7) + version;
	    const profile = Number(parts[1]);
	    const levelAndTier = parts[2];
	    const level = Number(levelAndTier.slice(0, -1));
	    const secondByte = (profile << 5) + level;
	    const tier = levelAndTier.slice(-1) === 'H' ? 1 : 0;
	    const bitDepth = Number(parts[3]);
	    const highBitDepth = bitDepth === 8 ? 0 : 1;
	    const twelveBit = 0;
	    const monochrome = parts[4] ? Number(parts[4]) : 0;
	    const chromaSubsamplingX = parts[5] ? Number(parts[5][0]) : 1;
	    const chromaSubsamplingY = parts[5] ? Number(parts[5][1]) : 1;
	    const chromaSamplePosition = parts[5] ? Number(parts[5][2]) : 0; // CSP_UNKNOWN
	    const thirdByte = (tier << 7)
	        + (highBitDepth << 6)
	        + (twelveBit << 5)
	        + (monochrome << 4)
	        + (chromaSubsamplingX << 3)
	        + (chromaSubsamplingY << 2)
	        + chromaSamplePosition;
	    const initialPresentationDelayPresent = 0; // Should be fine
	    const fourthByte = initialPresentationDelayPresent;
	    return [firstByte, secondByte, thirdByte, fourthByte];
	};
	const OPUS_SAMPLE_RATE = 48_000;
	const PCM_CODEC_REGEX = /^pcm-([usf])(\d+)+(be)?$/;
	const parsePcmCodec = (codec) => {
	    assert(PCM_AUDIO_CODECS.includes(codec));
	    if (codec === 'ulaw') {
	        return { dataType: 'ulaw', sampleSize: 1, littleEndian: true, silentValue: 255 };
	    }
	    else if (codec === 'alaw') {
	        return { dataType: 'alaw', sampleSize: 1, littleEndian: true, silentValue: 213 };
	    }
	    const match = PCM_CODEC_REGEX.exec(codec);
	    assert(match);
	    let dataType;
	    if (match[1] === 'u') {
	        dataType = 'unsigned';
	    }
	    else if (match[1] === 's') {
	        dataType = 'signed';
	    }
	    else {
	        dataType = 'float';
	    }
	    const sampleSize = (Number(match[2]) / 8);
	    const littleEndian = match[3] !== 'be';
	    const silentValue = codec === 'pcm-u8' ? 2 ** 7 : 0;
	    return { dataType, sampleSize, littleEndian, silentValue };
	};
	const VALID_VIDEO_CODEC_STRING_PREFIXES = ['avc1', 'avc3', 'hev1', 'hvc1', 'vp8', 'vp09', 'av01'];
	const AVC_CODEC_STRING_REGEX = /^(avc1|avc3)\.[0-9a-fA-F]{6}$/;
	const HEVC_CODEC_STRING_REGEX = /^(hev1|hvc1)\.(?:[ABC]?\d+)\.[0-9a-fA-F]{1,8}\.[LH]\d+(?:\.[0-9a-fA-F]{1,2}){0,6}$/;
	const VP9_CODEC_STRING_REGEX = /^vp09(?:\.\d{2}){3}(?:(?:\.\d{2}){5})?$/;
	const AV1_CODEC_STRING_REGEX = /^av01\.\d\.\d{2}[MH]\.\d{2}(?:\.\d\.\d{3}\.\d{2}\.\d{2}\.\d{2}\.\d)?$/;
	const validateVideoChunkMetadata = (metadata) => {
	    if (!metadata) {
	        throw new TypeError('Video chunk metadata must be provided.');
	    }
	    if (typeof metadata !== 'object') {
	        throw new TypeError('Video chunk metadata must be an object.');
	    }
	    if (!metadata.decoderConfig) {
	        throw new TypeError('Video chunk metadata must include a decoder configuration.');
	    }
	    if (typeof metadata.decoderConfig !== 'object') {
	        throw new TypeError('Video chunk metadata decoder configuration must be an object.');
	    }
	    if (typeof metadata.decoderConfig.codec !== 'string') {
	        throw new TypeError('Video chunk metadata decoder configuration must specify a codec string.');
	    }
	    if (!VALID_VIDEO_CODEC_STRING_PREFIXES.some(prefix => metadata.decoderConfig.codec.startsWith(prefix))) {
	        throw new TypeError('Video chunk metadata decoder configuration codec string must be a valid video codec string as specified in'
	            + ' the WebCodecs Codec Registry.');
	    }
	    if (!Number.isInteger(metadata.decoderConfig.codedWidth) || metadata.decoderConfig.codedWidth <= 0) {
	        throw new TypeError('Video chunk metadata decoder configuration must specify a valid codedWidth (positive integer).');
	    }
	    if (!Number.isInteger(metadata.decoderConfig.codedHeight) || metadata.decoderConfig.codedHeight <= 0) {
	        throw new TypeError('Video chunk metadata decoder configuration must specify a valid codedHeight (positive integer).');
	    }
	    if (metadata.decoderConfig.description !== undefined) {
	        if (!isAllowSharedBufferSource(metadata.decoderConfig.description)) {
	            throw new TypeError('Video chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an'
	                + ' ArrayBuffer view.');
	        }
	    }
	    if (metadata.decoderConfig.colorSpace !== undefined) {
	        const { colorSpace } = metadata.decoderConfig;
	        if (typeof colorSpace !== 'object') {
	            throw new TypeError('Video chunk metadata decoder configuration colorSpace, when provided, must be an object.');
	        }
	        const primariesValues = Object.keys(COLOR_PRIMARIES_MAP);
	        if (colorSpace.primaries != null && !primariesValues.includes(colorSpace.primaries)) {
	            throw new TypeError(`Video chunk metadata decoder configuration colorSpace primaries, when defined, must be one of`
	                + ` ${primariesValues.join(', ')}.`);
	        }
	        const transferValues = Object.keys(TRANSFER_CHARACTERISTICS_MAP);
	        if (colorSpace.transfer != null && !transferValues.includes(colorSpace.transfer)) {
	            throw new TypeError(`Video chunk metadata decoder configuration colorSpace transfer, when defined, must be one of`
	                + ` ${transferValues.join(', ')}.`);
	        }
	        const matrixValues = Object.keys(MATRIX_COEFFICIENTS_MAP);
	        if (colorSpace.matrix != null && !matrixValues.includes(colorSpace.matrix)) {
	            throw new TypeError(`Video chunk metadata decoder configuration colorSpace matrix, when defined, must be one of`
	                + ` ${matrixValues.join(', ')}.`);
	        }
	        if (colorSpace.fullRange != null && typeof colorSpace.fullRange !== 'boolean') {
	            throw new TypeError('Video chunk metadata decoder configuration colorSpace fullRange, when defined, must be a boolean.');
	        }
	    }
	    if (metadata.decoderConfig.codec.startsWith('avc1') || metadata.decoderConfig.codec.startsWith('avc3')) {
	        // AVC-specific validation
	        if (!AVC_CODEC_STRING_REGEX.test(metadata.decoderConfig.codec)) {
	            throw new TypeError('Video chunk metadata decoder configuration codec string for AVC must be a valid AVC codec string as'
	                + ' specified in Section 3.4 of RFC 6381.');
	        }
	        // `description` may or may not be set, depending on if the format is AVCC or Annex B, so don't perform any
	        // validation for it.
	        // https://www.w3.org/TR/webcodecs-avc-codec-registration
	    }
	    else if (metadata.decoderConfig.codec.startsWith('hev1') || metadata.decoderConfig.codec.startsWith('hvc1')) {
	        // HEVC-specific validation
	        if (!HEVC_CODEC_STRING_REGEX.test(metadata.decoderConfig.codec)) {
	            throw new TypeError('Video chunk metadata decoder configuration codec string for HEVC must be a valid HEVC codec string as'
	                + ' specified in Section E.3 of ISO 14496-15.');
	        }
	        // `description` may or may not be set, depending on if the format is HEVC or Annex B, so don't perform any
	        // validation for it.
	        // https://www.w3.org/TR/webcodecs-hevc-codec-registration
	    }
	    else if (metadata.decoderConfig.codec.startsWith('vp8')) {
	        // VP8-specific validation
	        if (metadata.decoderConfig.codec !== 'vp8') {
	            throw new TypeError('Video chunk metadata decoder configuration codec string for VP8 must be "vp8".');
	        }
	    }
	    else if (metadata.decoderConfig.codec.startsWith('vp09')) {
	        // VP9-specific validation
	        if (!VP9_CODEC_STRING_REGEX.test(metadata.decoderConfig.codec)) {
	            throw new TypeError('Video chunk metadata decoder configuration codec string for VP9 must be a valid VP9 codec string as'
	                + ' specified in Section "Codecs Parameter String" of https://www.webmproject.org/vp9/mp4/.');
	        }
	    }
	    else if (metadata.decoderConfig.codec.startsWith('av01')) {
	        // AV1-specific validation
	        if (!AV1_CODEC_STRING_REGEX.test(metadata.decoderConfig.codec)) {
	            throw new TypeError('Video chunk metadata decoder configuration codec string for AV1 must be a valid AV1 codec string as'
	                + ' specified in Section "Codecs Parameter String" of https://aomediacodec.github.io/av1-isobmff/.');
	        }
	    }
	};
	const VALID_AUDIO_CODEC_STRING_PREFIXES = ['mp4a', 'mp3', 'opus', 'vorbis', 'flac', 'ulaw', 'alaw', 'pcm'];
	const validateAudioChunkMetadata = (metadata) => {
	    if (!metadata) {
	        throw new TypeError('Audio chunk metadata must be provided.');
	    }
	    if (typeof metadata !== 'object') {
	        throw new TypeError('Audio chunk metadata must be an object.');
	    }
	    if (!metadata.decoderConfig) {
	        throw new TypeError('Audio chunk metadata must include a decoder configuration.');
	    }
	    if (typeof metadata.decoderConfig !== 'object') {
	        throw new TypeError('Audio chunk metadata decoder configuration must be an object.');
	    }
	    if (typeof metadata.decoderConfig.codec !== 'string') {
	        throw new TypeError('Audio chunk metadata decoder configuration must specify a codec string.');
	    }
	    if (!VALID_AUDIO_CODEC_STRING_PREFIXES.some(prefix => metadata.decoderConfig.codec.startsWith(prefix))) {
	        throw new TypeError('Audio chunk metadata decoder configuration codec string must be a valid audio codec string as specified in'
	            + ' the WebCodecs Codec Registry.');
	    }
	    if (!Number.isInteger(metadata.decoderConfig.sampleRate) || metadata.decoderConfig.sampleRate <= 0) {
	        throw new TypeError('Audio chunk metadata decoder configuration must specify a valid sampleRate (positive integer).');
	    }
	    if (!Number.isInteger(metadata.decoderConfig.numberOfChannels) || metadata.decoderConfig.numberOfChannels <= 0) {
	        throw new TypeError('Audio chunk metadata decoder configuration must specify a valid numberOfChannels (positive integer).');
	    }
	    if (metadata.decoderConfig.description !== undefined) {
	        if (!isAllowSharedBufferSource(metadata.decoderConfig.description)) {
	            throw new TypeError('Audio chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an'
	                + ' ArrayBuffer view.');
	        }
	    }
	    if (metadata.decoderConfig.codec.startsWith('mp4a')
	        // These three refer to MP3:
	        && metadata.decoderConfig.codec !== 'mp4a.69'
	        && metadata.decoderConfig.codec !== 'mp4a.6B'
	        && metadata.decoderConfig.codec !== 'mp4a.6b') {
	        // AAC-specific validation
	        const validStrings = ['mp4a.40.2', 'mp4a.40.02', 'mp4a.40.5', 'mp4a.40.05', 'mp4a.40.29', 'mp4a.67'];
	        if (!validStrings.includes(metadata.decoderConfig.codec)) {
	            throw new TypeError('Audio chunk metadata decoder configuration codec string for AAC must be a valid AAC codec string as'
	                + ' specified in https://www.w3.org/TR/webcodecs-aac-codec-registration/.');
	        }
	        if (!metadata.decoderConfig.description) {
	            throw new TypeError('Audio chunk metadata decoder configuration for AAC must include a description, which is expected to be'
	                + ' an AudioSpecificConfig as specified in ISO 14496-3.');
	        }
	    }
	    else if (metadata.decoderConfig.codec.startsWith('mp3') || metadata.decoderConfig.codec.startsWith('mp4a')) {
	        // MP3-specific validation
	        if (metadata.decoderConfig.codec !== 'mp3'
	            && metadata.decoderConfig.codec !== 'mp4a.69'
	            && metadata.decoderConfig.codec !== 'mp4a.6B'
	            && metadata.decoderConfig.codec !== 'mp4a.6b') {
	            throw new TypeError('Audio chunk metadata decoder configuration codec string for MP3 must be "mp3", "mp4a.69" or'
	                + ' "mp4a.6B".');
	        }
	    }
	    else if (metadata.decoderConfig.codec.startsWith('opus')) {
	        // Opus-specific validation
	        if (metadata.decoderConfig.codec !== 'opus') {
	            throw new TypeError('Audio chunk metadata decoder configuration codec string for Opus must be "opus".');
	        }
	        if (metadata.decoderConfig.description && metadata.decoderConfig.description.byteLength < 18) {
	            // Description is optional for Opus per-spec, so we shouldn't enforce it
	            throw new TypeError('Audio chunk metadata decoder configuration description, when specified, is expected to be an'
	                + ' Identification Header as specified in Section 5.1 of RFC 7845.');
	        }
	    }
	    else if (metadata.decoderConfig.codec.startsWith('vorbis')) {
	        // Vorbis-specific validation
	        if (metadata.decoderConfig.codec !== 'vorbis') {
	            throw new TypeError('Audio chunk metadata decoder configuration codec string for Vorbis must be "vorbis".');
	        }
	        if (!metadata.decoderConfig.description) {
	            throw new TypeError('Audio chunk metadata decoder configuration for Vorbis must include a description, which is expected to'
	                + ' adhere to the format described in https://www.w3.org/TR/webcodecs-vorbis-codec-registration/.');
	        }
	    }
	    else if (metadata.decoderConfig.codec.startsWith('flac')) {
	        // FLAC-specific validation
	        if (metadata.decoderConfig.codec !== 'flac') {
	            throw new TypeError('Audio chunk metadata decoder configuration codec string for FLAC must be "flac".');
	        }
	        const minDescriptionSize = 4 + 4 + 34; // 'fLaC' + metadata block header + STREAMINFO block
	        if (!metadata.decoderConfig.description || metadata.decoderConfig.description.byteLength < minDescriptionSize) {
	            throw new TypeError('Audio chunk metadata decoder configuration for FLAC must include a description, which is expected to'
	                + ' adhere to the format described in https://www.w3.org/TR/webcodecs-flac-codec-registration/.');
	        }
	    }
	    else if (metadata.decoderConfig.codec.startsWith('pcm')
	        || metadata.decoderConfig.codec.startsWith('ulaw')
	        || metadata.decoderConfig.codec.startsWith('alaw')) {
	        // PCM-specific validation
	        if (!PCM_AUDIO_CODECS.includes(metadata.decoderConfig.codec)) {
	            throw new TypeError('Audio chunk metadata decoder configuration codec string for PCM must be one of the supported PCM'
	                + ` codecs (${PCM_AUDIO_CODECS.join(', ')}).`);
	        }
	    }
	};
	const validateSubtitleMetadata = (metadata) => {
	    if (!metadata) {
	        throw new TypeError('Subtitle metadata must be provided.');
	    }
	    if (typeof metadata !== 'object') {
	        throw new TypeError('Subtitle metadata must be an object.');
	    }
	    if (!metadata.config) {
	        throw new TypeError('Subtitle metadata must include a config object.');
	    }
	    if (typeof metadata.config !== 'object') {
	        throw new TypeError('Subtitle metadata config must be an object.');
	    }
	    if (typeof metadata.config.description !== 'string') {
	        throw new TypeError('Subtitle metadata config description must be a string.');
	    }
	};

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	class Muxer {
	    constructor(output) {
	        this.mutex = new AsyncMutex();
	        /**
	         * This field is used to synchronize multiple MediaStreamTracks. They use the same time coordinate system across
	         * tracks, and to ensure correct audio-video sync, we must use the same offset for all of them. The reason an offset
	         * is needed at all is because the timestamps typically don't start at zero.
	         */
	        this.firstMediaStreamTimestamp = null;
	        this.trackTimestampInfo = new WeakMap();
	        this.output = output;
	    }
	    // eslint-disable-next-line @typescript-eslint/no-unused-vars
	    onTrackClose(track) { }
	    validateAndNormalizeTimestamp(track, timestampInSeconds, isKeyFrame) {
	        timestampInSeconds += track.source._timestampOffset;
	        let timestampInfo = this.trackTimestampInfo.get(track);
	        if (!timestampInfo) {
	            if (!isKeyFrame) {
	                throw new Error('First frame must be a key frame.');
	            }
	            timestampInfo = {
	                maxTimestamp: timestampInSeconds,
	                maxTimestampBeforeLastKeyFrame: timestampInSeconds,
	            };
	            this.trackTimestampInfo.set(track, timestampInfo);
	        }
	        if (timestampInSeconds < 0) {
	            throw new Error(`Timestamps must be non-negative (got ${timestampInSeconds}s).`);
	        }
	        if (isKeyFrame) {
	            timestampInfo.maxTimestampBeforeLastKeyFrame = timestampInfo.maxTimestamp;
	        }
	        if (timestampInSeconds < timestampInfo.maxTimestampBeforeLastKeyFrame) {
	            throw new Error(`Timestamps cannot be smaller than the highest timestamp of the previous GOP (a GOP begins with a key`
	                + ` frame and ends right before the next key frame). Got ${timestampInSeconds}s, but highest timestamp`
	                + ` is ${timestampInfo.maxTimestampBeforeLastKeyFrame}s.`);
	        }
	        timestampInfo.maxTimestamp = Math.max(timestampInfo.maxTimestamp, timestampInSeconds);
	        return timestampInSeconds;
	    }
	}

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	// References for AVC/HEVC code:
	// ISO 14496-15
	// Rec. ITU-T H.264
	// Rec. ITU-T H.265
	// https://stackoverflow.com/questions/24884827
	var AvcNalUnitType;
	(function (AvcNalUnitType) {
	    AvcNalUnitType[AvcNalUnitType["IDR"] = 5] = "IDR";
	    AvcNalUnitType[AvcNalUnitType["SPS"] = 7] = "SPS";
	    AvcNalUnitType[AvcNalUnitType["PPS"] = 8] = "PPS";
	    AvcNalUnitType[AvcNalUnitType["SPS_EXT"] = 13] = "SPS_EXT";
	})(AvcNalUnitType || (AvcNalUnitType = {}));
	var HevcNalUnitType;
	(function (HevcNalUnitType) {
	    HevcNalUnitType[HevcNalUnitType["RASL_N"] = 8] = "RASL_N";
	    HevcNalUnitType[HevcNalUnitType["RASL_R"] = 9] = "RASL_R";
	    HevcNalUnitType[HevcNalUnitType["BLA_W_LP"] = 16] = "BLA_W_LP";
	    HevcNalUnitType[HevcNalUnitType["RSV_IRAP_VCL23"] = 23] = "RSV_IRAP_VCL23";
	    HevcNalUnitType[HevcNalUnitType["VPS_NUT"] = 32] = "VPS_NUT";
	    HevcNalUnitType[HevcNalUnitType["SPS_NUT"] = 33] = "SPS_NUT";
	    HevcNalUnitType[HevcNalUnitType["PPS_NUT"] = 34] = "PPS_NUT";
	    HevcNalUnitType[HevcNalUnitType["PREFIX_SEI_NUT"] = 39] = "PREFIX_SEI_NUT";
	    HevcNalUnitType[HevcNalUnitType["SUFFIX_SEI_NUT"] = 40] = "SUFFIX_SEI_NUT";
	})(HevcNalUnitType || (HevcNalUnitType = {}));
	/** Finds all NAL units in an AVC packet in Annex B format. */
	const findNalUnitsInAnnexB = (packetData) => {
	    const nalUnits = [];
	    let i = 0;
	    while (i < packetData.length) {
	        let startCodePos = -1;
	        let startCodeLength = 0;
	        for (let j = i; j < packetData.length - 3; j++) {
	            // Check for 3-byte start code (0x000001)
	            if (packetData[j] === 0 && packetData[j + 1] === 0 && packetData[j + 2] === 1) {
	                startCodePos = j;
	                startCodeLength = 3;
	                break;
	            }
	            // Check for 4-byte start code (0x00000001)
	            if (j < packetData.length - 4
	                && packetData[j] === 0
	                && packetData[j + 1] === 0
	                && packetData[j + 2] === 0
	                && packetData[j + 3] === 1) {
	                startCodePos = j;
	                startCodeLength = 4;
	                break;
	            }
	        }
	        if (startCodePos === -1) {
	            break; // No more start codes found
	        }
	        // If this isn't the first start code, extract the previous NAL unit
	        if (i > 0 && startCodePos > i) {
	            const nalData = packetData.subarray(i, startCodePos);
	            if (nalData.length > 0) {
	                nalUnits.push(nalData);
	            }
	        }
	        i = startCodePos + startCodeLength;
	    }
	    // Extract the last NAL unit if there is one
	    if (i < packetData.length) {
	        const nalData = packetData.subarray(i);
	        if (nalData.length > 0) {
	            nalUnits.push(nalData);
	        }
	    }
	    return nalUnits;
	};
	const removeEmulationPreventionBytes = (data) => {
	    const result = [];
	    const len = data.length;
	    for (let i = 0; i < len; i++) {
	        // Look for the 0x000003 pattern
	        if (i + 2 < len && data[i] === 0x00 && data[i + 1] === 0x00 && data[i + 2] === 0x03) {
	            result.push(0x00, 0x00); // Push the first two bytes
	            i += 2; // Skip the 0x03 byte
	        }
	        else {
	            result.push(data[i]);
	        }
	    }
	    return new Uint8Array(result);
	};
	/** Converts an AVC packet in Annex B format to length-prefixed format. */
	const transformAnnexBToLengthPrefixed = (packetData) => {
	    const NAL_UNIT_LENGTH_SIZE = 4;
	    const nalUnits = findNalUnitsInAnnexB(packetData);
	    if (nalUnits.length === 0) {
	        // If no NAL units were found, it's not valid Annex B data
	        return null;
	    }
	    let totalSize = 0;
	    for (const nalUnit of nalUnits) {
	        totalSize += NAL_UNIT_LENGTH_SIZE + nalUnit.byteLength;
	    }
	    const avccData = new Uint8Array(totalSize);
	    const dataView = new DataView(avccData.buffer);
	    let offset = 0;
	    // Write each NAL unit with its length prefix
	    for (const nalUnit of nalUnits) {
	        const length = nalUnit.byteLength;
	        dataView.setUint32(offset, length, false);
	        offset += 4;
	        avccData.set(nalUnit, offset);
	        offset += nalUnit.byteLength;
	    }
	    return avccData;
	};
	const extractNalUnitTypeForAvc = (data) => {
	    return data[0] & 0x1F;
	};
	/** Builds an AvcDecoderConfigurationRecord from an AVC packet in Annex B format. */
	const extractAvcDecoderConfigurationRecord = (packetData) => {
	    try {
	        const nalUnits = findNalUnitsInAnnexB(packetData);
	        const spsUnits = nalUnits.filter(unit => extractNalUnitTypeForAvc(unit) === AvcNalUnitType.SPS);
	        const ppsUnits = nalUnits.filter(unit => extractNalUnitTypeForAvc(unit) === AvcNalUnitType.PPS);
	        const spsExtUnits = nalUnits.filter(unit => extractNalUnitTypeForAvc(unit) === AvcNalUnitType.SPS_EXT);
	        if (spsUnits.length === 0) {
	            return null;
	        }
	        if (ppsUnits.length === 0) {
	            return null;
	        }
	        // Let's get the first SPS for profile and level information
	        const spsData = spsUnits[0];
	        const bitstream = new Bitstream(removeEmulationPreventionBytes(spsData));
	        bitstream.skipBits(1); // forbidden_zero_bit
	        bitstream.skipBits(2); // nal_ref_idc
	        const nal_unit_type = bitstream.readBits(5);
	        if (nal_unit_type !== 7) { // SPS NAL unit type is 7
	            console.error('Invalid SPS NAL unit type');
	            return null;
	        }
	        const profile_idc = bitstream.readAlignedByte();
	        const constraint_flags = bitstream.readAlignedByte();
	        const level_idc = bitstream.readAlignedByte();
	        const record = {
	            configurationVersion: 1,
	            avcProfileIndication: profile_idc,
	            profileCompatibility: constraint_flags,
	            avcLevelIndication: level_idc,
	            lengthSizeMinusOne: 3, // Typically 4 bytes for length field
	            sequenceParameterSets: spsUnits,
	            pictureParameterSets: ppsUnits,
	            chromaFormat: null,
	            bitDepthLumaMinus8: null,
	            bitDepthChromaMinus8: null,
	            sequenceParameterSetExt: null,
	        };
	        if (profile_idc === 100
	            || profile_idc === 110
	            || profile_idc === 122
	            || profile_idc === 144) {
	            readExpGolomb(bitstream); // seq_parameter_set_id
	            const chroma_format_idc = readExpGolomb(bitstream);
	            if (chroma_format_idc === 3) {
	                bitstream.skipBits(1); // separate_colour_plane_flag
	            }
	            const bit_depth_luma_minus8 = readExpGolomb(bitstream);
	            const bit_depth_chroma_minus8 = readExpGolomb(bitstream);
	            record.chromaFormat = chroma_format_idc;
	            record.bitDepthLumaMinus8 = bit_depth_luma_minus8;
	            record.bitDepthChromaMinus8 = bit_depth_chroma_minus8;
	            record.sequenceParameterSetExt = spsExtUnits;
	        }
	        return record;
	    }
	    catch (error) {
	        console.error('Error building AVC Decoder Configuration Record:', error);
	        return null;
	    }
	};
	/** Serializes an AvcDecoderConfigurationRecord into the format specified in Section 5.3.3.1 of ISO 14496-15. */
	const serializeAvcDecoderConfigurationRecord = (record) => {
	    const bytes = [];
	    // Write header
	    bytes.push(record.configurationVersion);
	    bytes.push(record.avcProfileIndication);
	    bytes.push(record.profileCompatibility);
	    bytes.push(record.avcLevelIndication);
	    bytes.push(0xFC | (record.lengthSizeMinusOne & 0x03)); // Reserved bits (6) + lengthSizeMinusOne (2)
	    // Reserved bits (3) + numOfSequenceParameterSets (5)
	    bytes.push(0xE0 | (record.sequenceParameterSets.length & 0x1F));
	    // Write SPS
	    for (const sps of record.sequenceParameterSets) {
	        const length = sps.byteLength;
	        bytes.push(length >> 8); // High byte
	        bytes.push(length & 0xFF); // Low byte
	        for (let i = 0; i < length; i++) {
	            bytes.push(sps[i]);
	        }
	    }
	    bytes.push(record.pictureParameterSets.length);
	    // Write PPS
	    for (const pps of record.pictureParameterSets) {
	        const length = pps.byteLength;
	        bytes.push(length >> 8); // High byte
	        bytes.push(length & 0xFF); // Low byte
	        for (let i = 0; i < length; i++) {
	            bytes.push(pps[i]);
	        }
	    }
	    if (record.avcProfileIndication === 100
	        || record.avcProfileIndication === 110
	        || record.avcProfileIndication === 122
	        || record.avcProfileIndication === 144) {
	        assert(record.chromaFormat !== null);
	        assert(record.bitDepthLumaMinus8 !== null);
	        assert(record.bitDepthChromaMinus8 !== null);
	        assert(record.sequenceParameterSetExt !== null);
	        bytes.push(0xFC | (record.chromaFormat & 0x03)); // Reserved bits + chroma_format
	        bytes.push(0xF8 | (record.bitDepthLumaMinus8 & 0x07)); // Reserved bits + bit_depth_luma_minus8
	        bytes.push(0xF8 | (record.bitDepthChromaMinus8 & 0x07)); // Reserved bits + bit_depth_chroma_minus8
	        bytes.push(record.sequenceParameterSetExt.length);
	        // Write SPS Ext
	        for (const spsExt of record.sequenceParameterSetExt) {
	            const length = spsExt.byteLength;
	            bytes.push(length >> 8); // High byte
	            bytes.push(length & 0xFF); // Low byte
	            for (let i = 0; i < length; i++) {
	                bytes.push(spsExt[i]);
	            }
	        }
	    }
	    return new Uint8Array(bytes);
	};
	const extractNalUnitTypeForHevc = (data) => {
	    return (data[0] >> 1) & 0x3F;
	};
	/** Builds a HevcDecoderConfigurationRecord from an HEVC packet in Annex B format. */
	const extractHevcDecoderConfigurationRecord = (packetData) => {
	    try {
	        const nalUnits = findNalUnitsInAnnexB(packetData);
	        const vpsUnits = nalUnits.filter(unit => extractNalUnitTypeForHevc(unit) === HevcNalUnitType.VPS_NUT);
	        const spsUnits = nalUnits.filter(unit => extractNalUnitTypeForHevc(unit) === HevcNalUnitType.SPS_NUT);
	        const ppsUnits = nalUnits.filter(unit => extractNalUnitTypeForHevc(unit) === HevcNalUnitType.PPS_NUT);
	        const seiUnits = nalUnits.filter(unit => extractNalUnitTypeForHevc(unit) === HevcNalUnitType.PREFIX_SEI_NUT
	            || extractNalUnitTypeForHevc(unit) === HevcNalUnitType.SUFFIX_SEI_NUT);
	        if (spsUnits.length === 0 || ppsUnits.length === 0)
	            return null;
	        const sps = spsUnits[0];
	        const bitstream = new Bitstream(removeEmulationPreventionBytes(sps));
	        bitstream.skipBits(16); // NAL header
	        bitstream.readBits(4); // sps_video_parameter_set_id
	        const sps_max_sub_layers_minus1 = bitstream.readBits(3);
	        const sps_temporal_id_nesting_flag = bitstream.readBits(1);
	        const { general_profile_space, general_tier_flag, general_profile_idc, general_profile_compatibility_flags, general_constraint_indicator_flags, general_level_idc, } = parseProfileTierLevel(bitstream, sps_max_sub_layers_minus1);
	        readExpGolomb(bitstream); // sps_seq_parameter_set_id
	        const chroma_format_idc = readExpGolomb(bitstream);
	        if (chroma_format_idc === 3)
	            bitstream.skipBits(1); // separate_colour_plane_flag
	        readExpGolomb(bitstream); // pic_width_in_luma_samples
	        readExpGolomb(bitstream); // pic_height_in_luma_samples
	        if (bitstream.readBits(1)) { // conformance_window_flag
	            readExpGolomb(bitstream); // conf_win_left_offset
	            readExpGolomb(bitstream); // conf_win_right_offset
	            readExpGolomb(bitstream); // conf_win_top_offset
	            readExpGolomb(bitstream); // conf_win_bottom_offset
	        }
	        const bit_depth_luma_minus8 = readExpGolomb(bitstream);
	        const bit_depth_chroma_minus8 = readExpGolomb(bitstream);
	        readExpGolomb(bitstream); // log2_max_pic_order_cnt_lsb_minus4
	        const sps_sub_layer_ordering_info_present_flag = bitstream.readBits(1);
	        const maxNum = sps_sub_layer_ordering_info_present_flag ? 0 : sps_max_sub_layers_minus1;
	        for (let i = maxNum; i <= sps_max_sub_layers_minus1; i++) {
	            readExpGolomb(bitstream); // sps_max_dec_pic_buffering_minus1[i]
	            readExpGolomb(bitstream); // sps_max_num_reorder_pics[i]
	            readExpGolomb(bitstream); // sps_max_latency_increase_plus1[i]
	        }
	        readExpGolomb(bitstream); // log2_min_luma_coding_block_size_minus3
	        readExpGolomb(bitstream); // log2_diff_max_min_luma_coding_block_size
	        readExpGolomb(bitstream); // log2_min_luma_transform_block_size_minus2
	        readExpGolomb(bitstream); // log2_diff_max_min_luma_transform_block_size
	        readExpGolomb(bitstream); // max_transform_hierarchy_depth_inter
	        readExpGolomb(bitstream); // max_transform_hierarchy_depth_intra
	        if (bitstream.readBits(1)) { // scaling_list_enabled_flag
	            if (bitstream.readBits(1)) {
	                skipScalingListData(bitstream);
	            }
	        }
	        bitstream.skipBits(1); // amp_enabled_flag
	        bitstream.skipBits(1); // sample_adaptive_offset_enabled_flag
	        if (bitstream.readBits(1)) { // pcm_enabled_flag
	            bitstream.skipBits(4); // pcm_sample_bit_depth_luma_minus1
	            bitstream.skipBits(4); // pcm_sample_bit_depth_chroma_minus1
	            readExpGolomb(bitstream); // log2_min_pcm_luma_coding_block_size_minus3
	            readExpGolomb(bitstream); // log2_diff_max_min_pcm_luma_coding_block_size
	            bitstream.skipBits(1); // pcm_loop_filter_disabled_flag
	        }
	        const num_short_term_ref_pic_sets = readExpGolomb(bitstream);
	        skipAllStRefPicSets(bitstream, num_short_term_ref_pic_sets);
	        if (bitstream.readBits(1)) { // long_term_ref_pics_present_flag
	            const num_long_term_ref_pics_sps = readExpGolomb(bitstream);
	            for (let i = 0; i < num_long_term_ref_pics_sps; i++) {
	                readExpGolomb(bitstream); // lt_ref_pic_poc_lsb_sps[i]
	                bitstream.skipBits(1); // used_by_curr_pic_lt_sps_flag[i]
	            }
	        }
	        bitstream.skipBits(1); // sps_temporal_mvp_enabled_flag
	        bitstream.skipBits(1); // strong_intra_smoothing_enabled_flag
	        let min_spatial_segmentation_idc = 0;
	        if (bitstream.readBits(1)) { // vui_parameters_present_flag
	            min_spatial_segmentation_idc = parseVuiForMinSpatialSegmentationIdc(bitstream, sps_max_sub_layers_minus1);
	        }
	        // Parse PPS for parallelismType
	        let parallelismType = 0;
	        if (ppsUnits.length > 0) {
	            const pps = ppsUnits[0];
	            const ppsBitstream = new Bitstream(removeEmulationPreventionBytes(pps));
	            ppsBitstream.skipBits(16); // NAL header
	            readExpGolomb(ppsBitstream); // pps_pic_parameter_set_id
	            readExpGolomb(ppsBitstream); // pps_seq_parameter_set_id
	            ppsBitstream.skipBits(1); // dependent_slice_segments_enabled_flag
	            ppsBitstream.skipBits(1); // output_flag_present_flag
	            ppsBitstream.skipBits(3); // num_extra_slice_header_bits
	            ppsBitstream.skipBits(1); // sign_data_hiding_enabled_flag
	            ppsBitstream.skipBits(1); // cabac_init_present_flag
	            readExpGolomb(ppsBitstream); // num_ref_idx_l0_default_active_minus1
	            readExpGolomb(ppsBitstream); // num_ref_idx_l1_default_active_minus1
	            readSignedExpGolomb(ppsBitstream); // init_qp_minus26
	            ppsBitstream.skipBits(1); // constrained_intra_pred_flag
	            ppsBitstream.skipBits(1); // transform_skip_enabled_flag
	            if (ppsBitstream.readBits(1)) { // cu_qp_delta_enabled_flag
	                readExpGolomb(ppsBitstream); // diff_cu_qp_delta_depth
	            }
	            readSignedExpGolomb(ppsBitstream); // pps_cb_qp_offset
	            readSignedExpGolomb(ppsBitstream); // pps_cr_qp_offset
	            ppsBitstream.skipBits(1); // pps_slice_chroma_qp_offsets_present_flag
	            ppsBitstream.skipBits(1); // weighted_pred_flag
	            ppsBitstream.skipBits(1); // weighted_bipred_flag
	            ppsBitstream.skipBits(1); // transquant_bypass_enabled_flag
	            const tiles_enabled_flag = ppsBitstream.readBits(1);
	            const entropy_coding_sync_enabled_flag = ppsBitstream.readBits(1);
	            if (!tiles_enabled_flag && !entropy_coding_sync_enabled_flag)
	                parallelismType = 0;
	            else if (tiles_enabled_flag && !entropy_coding_sync_enabled_flag)
	                parallelismType = 2;
	            else if (!tiles_enabled_flag && entropy_coding_sync_enabled_flag)
	                parallelismType = 3;
	            else
	                parallelismType = 0;
	        }
	        const arrays = [
	            ...(vpsUnits.length
	                ? [
	                    {
	                        arrayCompleteness: 1,
	                        nalUnitType: HevcNalUnitType.VPS_NUT,
	                        nalUnits: vpsUnits,
	                    },
	                ]
	                : []),
	            ...(spsUnits.length
	                ? [
	                    {
	                        arrayCompleteness: 1,
	                        nalUnitType: HevcNalUnitType.SPS_NUT,
	                        nalUnits: spsUnits,
	                    },
	                ]
	                : []),
	            ...(ppsUnits.length
	                ? [
	                    {
	                        arrayCompleteness: 1,
	                        nalUnitType: HevcNalUnitType.PPS_NUT,
	                        nalUnits: ppsUnits,
	                    },
	                ]
	                : []),
	            ...(seiUnits.length
	                ? [
	                    {
	                        arrayCompleteness: 1,
	                        nalUnitType: extractNalUnitTypeForHevc(seiUnits[0]),
	                        nalUnits: seiUnits,
	                    },
	                ]
	                : []),
	        ];
	        const record = {
	            configurationVersion: 1,
	            generalProfileSpace: general_profile_space,
	            generalTierFlag: general_tier_flag,
	            generalProfileIdc: general_profile_idc,
	            generalProfileCompatibilityFlags: general_profile_compatibility_flags,
	            generalConstraintIndicatorFlags: general_constraint_indicator_flags,
	            generalLevelIdc: general_level_idc,
	            minSpatialSegmentationIdc: min_spatial_segmentation_idc,
	            parallelismType,
	            chromaFormatIdc: chroma_format_idc,
	            bitDepthLumaMinus8: bit_depth_luma_minus8,
	            bitDepthChromaMinus8: bit_depth_chroma_minus8,
	            avgFrameRate: 0,
	            constantFrameRate: 0,
	            numTemporalLayers: sps_max_sub_layers_minus1 + 1,
	            temporalIdNested: sps_temporal_id_nesting_flag,
	            lengthSizeMinusOne: 3,
	            arrays,
	        };
	        return record;
	    }
	    catch (error) {
	        console.error('Error building HEVC Decoder Configuration Record:', error);
	        return null;
	    }
	};
	const parseProfileTierLevel = (bitstream, maxNumSubLayersMinus1) => {
	    const general_profile_space = bitstream.readBits(2);
	    const general_tier_flag = bitstream.readBits(1);
	    const general_profile_idc = bitstream.readBits(5);
	    let general_profile_compatibility_flags = 0;
	    for (let i = 0; i < 32; i++) {
	        general_profile_compatibility_flags = (general_profile_compatibility_flags << 1) | bitstream.readBits(1);
	    }
	    const general_constraint_indicator_flags = new Uint8Array(6);
	    for (let i = 0; i < 6; i++) {
	        general_constraint_indicator_flags[i] = bitstream.readBits(8);
	    }
	    const general_level_idc = bitstream.readBits(8);
	    const sub_layer_profile_present_flag = [];
	    const sub_layer_level_present_flag = [];
	    for (let i = 0; i < maxNumSubLayersMinus1; i++) {
	        sub_layer_profile_present_flag.push(bitstream.readBits(1));
	        sub_layer_level_present_flag.push(bitstream.readBits(1));
	    }
	    if (maxNumSubLayersMinus1 > 0) {
	        for (let i = maxNumSubLayersMinus1; i < 8; i++) {
	            bitstream.skipBits(2); // reserved_zero_2bits
	        }
	    }
	    for (let i = 0; i < maxNumSubLayersMinus1; i++) {
	        if (sub_layer_profile_present_flag[i])
	            bitstream.skipBits(88);
	        if (sub_layer_level_present_flag[i])
	            bitstream.skipBits(8);
	    }
	    return {
	        general_profile_space,
	        general_tier_flag,
	        general_profile_idc,
	        general_profile_compatibility_flags,
	        general_constraint_indicator_flags,
	        general_level_idc,
	    };
	};
	const skipScalingListData = (bitstream) => {
	    for (let sizeId = 0; sizeId < 4; sizeId++) {
	        for (let matrixId = 0; matrixId < (sizeId === 3 ? 2 : 6); matrixId++) {
	            const scaling_list_pred_mode_flag = bitstream.readBits(1);
	            if (!scaling_list_pred_mode_flag) {
	                readExpGolomb(bitstream); // scaling_list_pred_matrix_id_delta
	            }
	            else {
	                const coefNum = Math.min(64, 1 << (4 + (sizeId << 1)));
	                if (sizeId > 1) {
	                    readSignedExpGolomb(bitstream); // scaling_list_dc_coef_minus8
	                }
	                for (let i = 0; i < coefNum; i++) {
	                    readSignedExpGolomb(bitstream); // scaling_list_delta_coef
	                }
	            }
	        }
	    }
	};
	const skipAllStRefPicSets = (bitstream, num_short_term_ref_pic_sets) => {
	    const NumDeltaPocs = [];
	    for (let stRpsIdx = 0; stRpsIdx < num_short_term_ref_pic_sets; stRpsIdx++) {
	        NumDeltaPocs[stRpsIdx] = skipStRefPicSet(bitstream, stRpsIdx, num_short_term_ref_pic_sets, NumDeltaPocs);
	    }
	};
	const skipStRefPicSet = (bitstream, stRpsIdx, num_short_term_ref_pic_sets, NumDeltaPocs) => {
	    let NumDeltaPocsThis = 0;
	    let inter_ref_pic_set_prediction_flag = 0;
	    let RefRpsIdx = 0;
	    if (stRpsIdx !== 0) {
	        inter_ref_pic_set_prediction_flag = bitstream.readBits(1);
	    }
	    if (inter_ref_pic_set_prediction_flag) {
	        if (stRpsIdx === num_short_term_ref_pic_sets) {
	            const delta_idx_minus1 = readExpGolomb(bitstream);
	            RefRpsIdx = stRpsIdx - (delta_idx_minus1 + 1);
	        }
	        else {
	            RefRpsIdx = stRpsIdx - 1;
	        }
	        bitstream.readBits(1); // delta_rps_sign
	        readExpGolomb(bitstream); // abs_delta_rps_minus1
	        // The number of iterations is NumDeltaPocs[RefRpsIdx] + 1
	        const numDelta = NumDeltaPocs[RefRpsIdx] ?? 0;
	        for (let j = 0; j <= numDelta; j++) {
	            const used_by_curr_pic_flag = bitstream.readBits(1);
	            if (!used_by_curr_pic_flag) {
	                bitstream.readBits(1); // use_delta_flag
	            }
	        }
	        NumDeltaPocsThis = NumDeltaPocs[RefRpsIdx];
	    }
	    else {
	        const num_negative_pics = readExpGolomb(bitstream);
	        const num_positive_pics = readExpGolomb(bitstream);
	        for (let i = 0; i < num_negative_pics; i++) {
	            readExpGolomb(bitstream); // delta_poc_s0_minus1[i]
	            bitstream.readBits(1); // used_by_curr_pic_s0_flag[i]
	        }
	        for (let i = 0; i < num_positive_pics; i++) {
	            readExpGolomb(bitstream); // delta_poc_s1_minus1[i]
	            bitstream.readBits(1); // used_by_curr_pic_s1_flag[i]
	        }
	        NumDeltaPocsThis = num_negative_pics + num_positive_pics;
	    }
	    return NumDeltaPocsThis;
	};
	const parseVuiForMinSpatialSegmentationIdc = (bitstream, sps_max_sub_layers_minus1) => {
	    if (bitstream.readBits(1)) { // aspect_ratio_info_present_flag
	        const aspect_ratio_idc = bitstream.readBits(8);
	        if (aspect_ratio_idc === 255) {
	            bitstream.readBits(16); // sar_width
	            bitstream.readBits(16); // sar_height
	        }
	    }
	    if (bitstream.readBits(1)) { // overscan_info_present_flag
	        bitstream.readBits(1); // overscan_appropriate_flag
	    }
	    if (bitstream.readBits(1)) { // video_signal_type_present_flag
	        bitstream.readBits(3); // video_format
	        bitstream.readBits(1); // video_full_range_flag
	        if (bitstream.readBits(1)) {
	            bitstream.readBits(8); // colour_primaries
	            bitstream.readBits(8); // transfer_characteristics
	            bitstream.readBits(8); // matrix_coeffs
	        }
	    }
	    if (bitstream.readBits(1)) { // chroma_loc_info_present_flag
	        readExpGolomb(bitstream); // chroma_sample_loc_type_top_field
	        readExpGolomb(bitstream); // chroma_sample_loc_type_bottom_field
	    }
	    bitstream.readBits(1); // neutral_chroma_indication_flag
	    bitstream.readBits(1); // field_seq_flag
	    bitstream.readBits(1); // frame_field_info_present_flag
	    if (bitstream.readBits(1)) { // default_display_window_flag
	        readExpGolomb(bitstream); // def_disp_win_left_offset
	        readExpGolomb(bitstream); // def_disp_win_right_offset
	        readExpGolomb(bitstream); // def_disp_win_top_offset
	        readExpGolomb(bitstream); // def_disp_win_bottom_offset
	    }
	    if (bitstream.readBits(1)) { // vui_timing_info_present_flag
	        bitstream.readBits(32); // vui_num_units_in_tick
	        bitstream.readBits(32); // vui_time_scale
	        if (bitstream.readBits(1)) { // vui_poc_proportional_to_timing_flag
	            readExpGolomb(bitstream); // vui_num_ticks_poc_diff_one_minus1
	        }
	        if (bitstream.readBits(1)) {
	            skipHrdParameters(bitstream, true, sps_max_sub_layers_minus1);
	        }
	    }
	    if (bitstream.readBits(1)) { // bitstream_restriction_flag
	        bitstream.readBits(1); // tiles_fixed_structure_flag
	        bitstream.readBits(1); // motion_vectors_over_pic_boundaries_flag
	        bitstream.readBits(1); // restricted_ref_pic_lists_flag
	        const min_spatial_segmentation_idc = readExpGolomb(bitstream);
	        // skip the rest
	        readExpGolomb(bitstream); // max_bytes_per_pic_denom
	        readExpGolomb(bitstream); // max_bits_per_min_cu_denom
	        readExpGolomb(bitstream); // log2_max_mv_length_horizontal
	        readExpGolomb(bitstream); // log2_max_mv_length_vertical
	        return min_spatial_segmentation_idc;
	    }
	    return 0;
	};
	const skipHrdParameters = (bitstream, commonInfPresentFlag, maxNumSubLayersMinus1) => {
	    let nal_hrd_parameters_present_flag = false;
	    let vcl_hrd_parameters_present_flag = false;
	    let sub_pic_hrd_params_present_flag = false;
	    {
	        nal_hrd_parameters_present_flag = bitstream.readBits(1) === 1;
	        vcl_hrd_parameters_present_flag = bitstream.readBits(1) === 1;
	        if (nal_hrd_parameters_present_flag || vcl_hrd_parameters_present_flag) {
	            sub_pic_hrd_params_present_flag = bitstream.readBits(1) === 1;
	            if (sub_pic_hrd_params_present_flag) {
	                bitstream.readBits(8); // tick_divisor_minus2
	                bitstream.readBits(5); // du_cpb_removal_delay_increment_length_minus1
	                bitstream.readBits(1); // sub_pic_cpb_params_in_pic_timing_sei_flag
	                bitstream.readBits(5); // dpb_output_delay_du_length_minus1
	            }
	            bitstream.readBits(4); // bit_rate_scale
	            bitstream.readBits(4); // cpb_size_scale
	            if (sub_pic_hrd_params_present_flag) {
	                bitstream.readBits(4); // cpb_size_du_scale
	            }
	            bitstream.readBits(5); // initial_cpb_removal_delay_length_minus1
	            bitstream.readBits(5); // au_cpb_removal_delay_length_minus1
	            bitstream.readBits(5); // dpb_output_delay_length_minus1
	        }
	    }
	    for (let i = 0; i <= maxNumSubLayersMinus1; i++) {
	        const fixed_pic_rate_general_flag = bitstream.readBits(1) === 1;
	        let fixed_pic_rate_within_cvs_flag = true; // Default assumption if general is true
	        if (!fixed_pic_rate_general_flag) {
	            fixed_pic_rate_within_cvs_flag = bitstream.readBits(1) === 1;
	        }
	        let low_delay_hrd_flag = false; // Default assumption
	        if (fixed_pic_rate_within_cvs_flag) {
	            readExpGolomb(bitstream); // elemental_duration_in_tc_minus1[i]
	        }
	        else {
	            low_delay_hrd_flag = bitstream.readBits(1) === 1;
	        }
	        let CpbCnt = 1; // Default if low_delay is true
	        if (!low_delay_hrd_flag) {
	            const cpb_cnt_minus1 = readExpGolomb(bitstream); // cpb_cnt_minus1[i]
	            CpbCnt = cpb_cnt_minus1 + 1;
	        }
	        if (nal_hrd_parameters_present_flag) {
	            skipSubLayerHrdParameters(bitstream, CpbCnt, sub_pic_hrd_params_present_flag);
	        }
	        if (vcl_hrd_parameters_present_flag) {
	            skipSubLayerHrdParameters(bitstream, CpbCnt, sub_pic_hrd_params_present_flag);
	        }
	    }
	};
	const skipSubLayerHrdParameters = (bitstream, CpbCnt, sub_pic_hrd_params_present_flag) => {
	    for (let i = 0; i < CpbCnt; i++) {
	        readExpGolomb(bitstream); // bit_rate_value_minus1[i]
	        readExpGolomb(bitstream); // cpb_size_value_minus1[i]
	        if (sub_pic_hrd_params_present_flag) {
	            readExpGolomb(bitstream); // cpb_size_du_value_minus1[i]
	            readExpGolomb(bitstream); // bit_rate_du_value_minus1[i]
	        }
	        bitstream.readBits(1); // cbr_flag[i]
	    }
	};
	/** Serializes an HevcDecoderConfigurationRecord into the format specified in Section 8.3.3.1 of ISO 14496-15. */
	const serializeHevcDecoderConfigurationRecord = (record) => {
	    const bytes = [];
	    bytes.push(record.configurationVersion);
	    bytes.push(((record.generalProfileSpace & 0x3) << 6)
	        | ((record.generalTierFlag & 0x1) << 5)
	        | (record.generalProfileIdc & 0x1F));
	    bytes.push((record.generalProfileCompatibilityFlags >>> 24) & 0xFF);
	    bytes.push((record.generalProfileCompatibilityFlags >>> 16) & 0xFF);
	    bytes.push((record.generalProfileCompatibilityFlags >>> 8) & 0xFF);
	    bytes.push(record.generalProfileCompatibilityFlags & 0xFF);
	    bytes.push(...record.generalConstraintIndicatorFlags);
	    bytes.push(record.generalLevelIdc & 0xFF);
	    bytes.push(0xF0 | ((record.minSpatialSegmentationIdc >> 8) & 0x0F)); // Reserved + high nibble
	    bytes.push(record.minSpatialSegmentationIdc & 0xFF); // Low byte
	    bytes.push(0xFC | (record.parallelismType & 0x03));
	    bytes.push(0xFC | (record.chromaFormatIdc & 0x03));
	    bytes.push(0xF8 | (record.bitDepthLumaMinus8 & 0x07));
	    bytes.push(0xF8 | (record.bitDepthChromaMinus8 & 0x07));
	    bytes.push((record.avgFrameRate >> 8) & 0xFF); // High byte
	    bytes.push(record.avgFrameRate & 0xFF); // Low byte
	    bytes.push(((record.constantFrameRate & 0x03) << 6)
	        | ((record.numTemporalLayers & 0x07) << 3)
	        | ((record.temporalIdNested & 0x01) << 2)
	        | (record.lengthSizeMinusOne & 0x03));
	    bytes.push(record.arrays.length & 0xFF);
	    for (const arr of record.arrays) {
	        bytes.push(((arr.arrayCompleteness & 0x01) << 7)
	            | (0 << 6)
	            | (arr.nalUnitType & 0x3F));
	        bytes.push((arr.nalUnits.length >> 8) & 0xFF); // High byte
	        bytes.push(arr.nalUnits.length & 0xFF); // Low byte
	        for (const nal of arr.nalUnits) {
	            bytes.push((nal.length >> 8) & 0xFF); // High byte
	            bytes.push(nal.length & 0xFF); // Low byte
	            for (let i = 0; i < nal.length; i++) {
	                bytes.push(nal[i]);
	            }
	        }
	    }
	    return new Uint8Array(bytes);
	};
	const parseOpusIdentificationHeader = (bytes) => {
	    const view = toDataView(bytes);
	    const outputChannelCount = view.getUint8(9);
	    const preSkip = view.getUint16(10, true);
	    const inputSampleRate = view.getUint32(12, true);
	    const outputGain = view.getInt16(16, true);
	    const channelMappingFamily = view.getUint8(18);
	    let channelMappingTable = null;
	    if (channelMappingFamily) {
	        channelMappingTable = bytes.subarray(19, 19 + 2 + outputChannelCount);
	    }
	    return {
	        outputChannelCount,
	        preSkip,
	        inputSampleRate,
	        outputGain,
	        channelMappingFamily,
	        channelMappingTable,
	    };
	};
	var FlacBlockType;
	(function (FlacBlockType) {
	    FlacBlockType[FlacBlockType["STREAMINFO"] = 0] = "STREAMINFO";
	    FlacBlockType[FlacBlockType["VORBIS_COMMENT"] = 4] = "VORBIS_COMMENT";
	    FlacBlockType[FlacBlockType["PICTURE"] = 6] = "PICTURE";
	})(FlacBlockType || (FlacBlockType = {}));

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	const PLACEHOLDER_DATA = new Uint8Array(0);
	/**
	 * Represents an encoded chunk of media. Mainly used as an expressive wrapper around WebCodecs API's
	 * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) and
	 * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk), but can also be used
	 * standalone.
	 * @group Packets
	 * @public
	 */
	class EncodedPacket {
	    /** Creates a new {@link EncodedPacket} from raw bytes and timing information. */
	    constructor(
	    /** The encoded data of this packet. */
	    data, 
	    /** The type of this packet. */
	    type, 
	    /**
	     * The presentation timestamp of this packet in seconds. May be negative. Samples with negative end timestamps
	     * should not be presented.
	     */
	    timestamp, 
	    /** The duration of this packet in seconds. */
	    duration, 
	    /**
	     * The sequence number indicates the decode order of the packets. Packet A  must be decoded before packet B if A
	     * has a lower sequence number than B. If two packets have the same sequence number, they are the same packet.
	     * Otherwise, sequence numbers are arbitrary and are not guaranteed to have any meaning besides their relative
	     * ordering. Negative sequence numbers mean the sequence number is undefined.
	     */
	    sequenceNumber = -1, byteLength, sideData) {
	        this.data = data;
	        this.type = type;
	        this.timestamp = timestamp;
	        this.duration = duration;
	        this.sequenceNumber = sequenceNumber;
	        if (data === PLACEHOLDER_DATA && byteLength === undefined) {
	            throw new Error('Internal error: byteLength must be explicitly provided when constructing metadata-only packets.');
	        }
	        if (byteLength === undefined) {
	            byteLength = data.byteLength;
	        }
	        if (!(data instanceof Uint8Array)) {
	            throw new TypeError('data must be a Uint8Array.');
	        }
	        if (type !== 'key' && type !== 'delta') {
	            throw new TypeError('type must be either "key" or "delta".');
	        }
	        if (!Number.isFinite(timestamp)) {
	            throw new TypeError('timestamp must be a number.');
	        }
	        if (!Number.isFinite(duration) || duration < 0) {
	            throw new TypeError('duration must be a non-negative number.');
	        }
	        if (!Number.isFinite(sequenceNumber)) {
	            throw new TypeError('sequenceNumber must be a number.');
	        }
	        if (!Number.isInteger(byteLength) || byteLength < 0) {
	            throw new TypeError('byteLength must be a non-negative integer.');
	        }
	        if (sideData !== undefined && (typeof sideData !== 'object' || !sideData)) {
	            throw new TypeError('sideData, when provided, must be an object.');
	        }
	        if (sideData?.alpha !== undefined && !(sideData.alpha instanceof Uint8Array)) {
	            throw new TypeError('sideData.alpha, when provided, must be a Uint8Array.');
	        }
	        if (sideData?.alphaByteLength !== undefined
	            && (!Number.isInteger(sideData.alphaByteLength) || sideData.alphaByteLength < 0)) {
	            throw new TypeError('sideData.alphaByteLength, when provided, must be a non-negative integer.');
	        }
	        this.byteLength = byteLength;
	        this.sideData = sideData ?? {};
	        if (this.sideData.alpha && this.sideData.alphaByteLength === undefined) {
	            this.sideData.alphaByteLength = this.sideData.alpha.byteLength;
	        }
	    }
	    /** If this packet is a metadata-only packet. Metadata-only packets don't contain their packet data. */
	    get isMetadataOnly() {
	        return this.data === PLACEHOLDER_DATA;
	    }
	    /** The timestamp of this packet in microseconds. */
	    get microsecondTimestamp() {
	        return Math.trunc(SECOND_TO_MICROSECOND_FACTOR * this.timestamp);
	    }
	    /** The duration of this packet in microseconds. */
	    get microsecondDuration() {
	        return Math.trunc(SECOND_TO_MICROSECOND_FACTOR * this.duration);
	    }
	    /** Converts this packet to an
	     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
	     * WebCodecs API. */
	    toEncodedVideoChunk() {
	        if (this.isMetadataOnly) {
	            throw new TypeError('Metadata-only packets cannot be converted to a video chunk.');
	        }
	        if (typeof EncodedVideoChunk === 'undefined') {
	            throw new Error('Your browser does not support EncodedVideoChunk.');
	        }
	        return new EncodedVideoChunk({
	            data: this.data,
	            type: this.type,
	            timestamp: this.microsecondTimestamp,
	            duration: this.microsecondDuration,
	        });
	    }
	    /**
	     * Converts this packet to an
	     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
	     * WebCodecs API, using the alpha side data instead of the color data. Throws if no alpha side data is defined.
	     */
	    alphaToEncodedVideoChunk(type = this.type) {
	        if (!this.sideData.alpha) {
	            throw new TypeError('This packet does not contain alpha side data.');
	        }
	        if (this.isMetadataOnly) {
	            throw new TypeError('Metadata-only packets cannot be converted to a video chunk.');
	        }
	        if (typeof EncodedVideoChunk === 'undefined') {
	            throw new Error('Your browser does not support EncodedVideoChunk.');
	        }
	        return new EncodedVideoChunk({
	            data: this.sideData.alpha,
	            type,
	            timestamp: this.microsecondTimestamp,
	            duration: this.microsecondDuration,
	        });
	    }
	    /** Converts this packet to an
	     * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk) for use with the
	     * WebCodecs API. */
	    toEncodedAudioChunk() {
	        if (this.isMetadataOnly) {
	            throw new TypeError('Metadata-only packets cannot be converted to an audio chunk.');
	        }
	        if (typeof EncodedAudioChunk === 'undefined') {
	            throw new Error('Your browser does not support EncodedAudioChunk.');
	        }
	        return new EncodedAudioChunk({
	            data: this.data,
	            type: this.type,
	            timestamp: this.microsecondTimestamp,
	            duration: this.microsecondDuration,
	        });
	    }
	    /**
	     * Creates an {@link EncodedPacket} from an
	     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) or
	     * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk). This method is useful
	     * for converting chunks from the WebCodecs API to `EncodedPacket` instances.
	     */
	    static fromEncodedChunk(chunk, sideData) {
	        if (!(chunk instanceof EncodedVideoChunk || chunk instanceof EncodedAudioChunk)) {
	            throw new TypeError('chunk must be an EncodedVideoChunk or EncodedAudioChunk.');
	        }
	        const data = new Uint8Array(chunk.byteLength);
	        chunk.copyTo(data);
	        return new EncodedPacket(data, chunk.type, chunk.timestamp / 1e6, (chunk.duration ?? 0) / 1e6, undefined, undefined, sideData);
	    }
	    /** Clones this packet while optionally updating timing information. */
	    clone(options) {
	        if (options !== undefined && (typeof options !== 'object' || options === null)) {
	            throw new TypeError('options, when provided, must be an object.');
	        }
	        if (options?.timestamp !== undefined && !Number.isFinite(options.timestamp)) {
	            throw new TypeError('options.timestamp, when provided, must be a number.');
	        }
	        if (options?.duration !== undefined && !Number.isFinite(options.duration)) {
	            throw new TypeError('options.duration, when provided, must be a number.');
	        }
	        return new EncodedPacket(this.data, this.type, options?.timestamp ?? this.timestamp, options?.duration ?? this.duration, this.sequenceNumber, this.byteLength);
	    }
	}

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	const buildIsobmffMimeType = (info) => {
	    const base = info.hasVideo
	        ? 'video/'
	        : info.hasAudio
	            ? 'audio/'
	            : 'application/';
	    let string = base + (info.isQuickTime ? 'quicktime' : 'mp4');
	    if (info.codecStrings.length > 0) {
	        const uniqueCodecMimeTypes = [...new Set(info.codecStrings)];
	        string += `; codecs="${uniqueCodecMimeTypes.join(', ')}"`;
	    }
	    return string;
	};

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	const MIN_BOX_HEADER_SIZE = 8;
	const MAX_BOX_HEADER_SIZE = 16;

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	/** Wrapper around a number to be able to differentiate it in the writer. */
	class EBMLFloat32 {
	    constructor(value) {
	        this.value = value;
	    }
	}
	/** Wrapper around a number to be able to differentiate it in the writer. */
	class EBMLFloat64 {
	    constructor(value) {
	        this.value = value;
	    }
	}
	/** Wrapper around a number to be able to differentiate it in the writer. */
	class EBMLSignedInt {
	    constructor(value) {
	        this.value = value;
	    }
	}
	class EBMLUnicodeString {
	    constructor(value) {
	        this.value = value;
	    }
	}
	/** Defines some of the EBML IDs used by Matroska files. */
	var EBMLId;
	(function (EBMLId) {
	    EBMLId[EBMLId["EBML"] = 440786851] = "EBML";
	    EBMLId[EBMLId["EBMLVersion"] = 17030] = "EBMLVersion";
	    EBMLId[EBMLId["EBMLReadVersion"] = 17143] = "EBMLReadVersion";
	    EBMLId[EBMLId["EBMLMaxIDLength"] = 17138] = "EBMLMaxIDLength";
	    EBMLId[EBMLId["EBMLMaxSizeLength"] = 17139] = "EBMLMaxSizeLength";
	    EBMLId[EBMLId["DocType"] = 17026] = "DocType";
	    EBMLId[EBMLId["DocTypeVersion"] = 17031] = "DocTypeVersion";
	    EBMLId[EBMLId["DocTypeReadVersion"] = 17029] = "DocTypeReadVersion";
	    EBMLId[EBMLId["Void"] = 236] = "Void";
	    EBMLId[EBMLId["Segment"] = 408125543] = "Segment";
	    EBMLId[EBMLId["SeekHead"] = 290298740] = "SeekHead";
	    EBMLId[EBMLId["Seek"] = 19899] = "Seek";
	    EBMLId[EBMLId["SeekID"] = 21419] = "SeekID";
	    EBMLId[EBMLId["SeekPosition"] = 21420] = "SeekPosition";
	    EBMLId[EBMLId["Duration"] = 17545] = "Duration";
	    EBMLId[EBMLId["Info"] = 357149030] = "Info";
	    EBMLId[EBMLId["TimestampScale"] = 2807729] = "TimestampScale";
	    EBMLId[EBMLId["MuxingApp"] = 19840] = "MuxingApp";
	    EBMLId[EBMLId["WritingApp"] = 22337] = "WritingApp";
	    EBMLId[EBMLId["Tracks"] = 374648427] = "Tracks";
	    EBMLId[EBMLId["TrackEntry"] = 174] = "TrackEntry";
	    EBMLId[EBMLId["TrackNumber"] = 215] = "TrackNumber";
	    EBMLId[EBMLId["TrackUID"] = 29637] = "TrackUID";
	    EBMLId[EBMLId["TrackType"] = 131] = "TrackType";
	    EBMLId[EBMLId["FlagEnabled"] = 185] = "FlagEnabled";
	    EBMLId[EBMLId["FlagDefault"] = 136] = "FlagDefault";
	    EBMLId[EBMLId["FlagForced"] = 21930] = "FlagForced";
	    EBMLId[EBMLId["FlagLacing"] = 156] = "FlagLacing";
	    EBMLId[EBMLId["Name"] = 21358] = "Name";
	    EBMLId[EBMLId["Language"] = 2274716] = "Language";
	    EBMLId[EBMLId["LanguageBCP47"] = 2274717] = "LanguageBCP47";
	    EBMLId[EBMLId["CodecID"] = 134] = "CodecID";
	    EBMLId[EBMLId["CodecPrivate"] = 25506] = "CodecPrivate";
	    EBMLId[EBMLId["CodecDelay"] = 22186] = "CodecDelay";
	    EBMLId[EBMLId["SeekPreRoll"] = 22203] = "SeekPreRoll";
	    EBMLId[EBMLId["DefaultDuration"] = 2352003] = "DefaultDuration";
	    EBMLId[EBMLId["Video"] = 224] = "Video";
	    EBMLId[EBMLId["PixelWidth"] = 176] = "PixelWidth";
	    EBMLId[EBMLId["PixelHeight"] = 186] = "PixelHeight";
	    EBMLId[EBMLId["AlphaMode"] = 21440] = "AlphaMode";
	    EBMLId[EBMLId["Audio"] = 225] = "Audio";
	    EBMLId[EBMLId["SamplingFrequency"] = 181] = "SamplingFrequency";
	    EBMLId[EBMLId["Channels"] = 159] = "Channels";
	    EBMLId[EBMLId["BitDepth"] = 25188] = "BitDepth";
	    EBMLId[EBMLId["SimpleBlock"] = 163] = "SimpleBlock";
	    EBMLId[EBMLId["BlockGroup"] = 160] = "BlockGroup";
	    EBMLId[EBMLId["Block"] = 161] = "Block";
	    EBMLId[EBMLId["BlockAdditions"] = 30113] = "BlockAdditions";
	    EBMLId[EBMLId["BlockMore"] = 166] = "BlockMore";
	    EBMLId[EBMLId["BlockAdditional"] = 165] = "BlockAdditional";
	    EBMLId[EBMLId["BlockAddID"] = 238] = "BlockAddID";
	    EBMLId[EBMLId["BlockDuration"] = 155] = "BlockDuration";
	    EBMLId[EBMLId["ReferenceBlock"] = 251] = "ReferenceBlock";
	    EBMLId[EBMLId["Cluster"] = 524531317] = "Cluster";
	    EBMLId[EBMLId["Timestamp"] = 231] = "Timestamp";
	    EBMLId[EBMLId["Cues"] = 475249515] = "Cues";
	    EBMLId[EBMLId["CuePoint"] = 187] = "CuePoint";
	    EBMLId[EBMLId["CueTime"] = 179] = "CueTime";
	    EBMLId[EBMLId["CueTrackPositions"] = 183] = "CueTrackPositions";
	    EBMLId[EBMLId["CueTrack"] = 247] = "CueTrack";
	    EBMLId[EBMLId["CueClusterPosition"] = 241] = "CueClusterPosition";
	    EBMLId[EBMLId["Colour"] = 21936] = "Colour";
	    EBMLId[EBMLId["MatrixCoefficients"] = 21937] = "MatrixCoefficients";
	    EBMLId[EBMLId["TransferCharacteristics"] = 21946] = "TransferCharacteristics";
	    EBMLId[EBMLId["Primaries"] = 21947] = "Primaries";
	    EBMLId[EBMLId["Range"] = 21945] = "Range";
	    EBMLId[EBMLId["Projection"] = 30320] = "Projection";
	    EBMLId[EBMLId["ProjectionType"] = 30321] = "ProjectionType";
	    EBMLId[EBMLId["ProjectionPoseRoll"] = 30325] = "ProjectionPoseRoll";
	    EBMLId[EBMLId["Attachments"] = 423732329] = "Attachments";
	    EBMLId[EBMLId["AttachedFile"] = 24999] = "AttachedFile";
	    EBMLId[EBMLId["FileDescription"] = 18046] = "FileDescription";
	    EBMLId[EBMLId["FileName"] = 18030] = "FileName";
	    EBMLId[EBMLId["FileMediaType"] = 18016] = "FileMediaType";
	    EBMLId[EBMLId["FileData"] = 18012] = "FileData";
	    EBMLId[EBMLId["FileUID"] = 18094] = "FileUID";
	    EBMLId[EBMLId["Chapters"] = 272869232] = "Chapters";
	    EBMLId[EBMLId["Tags"] = 307544935] = "Tags";
	    EBMLId[EBMLId["Tag"] = 29555] = "Tag";
	    EBMLId[EBMLId["Targets"] = 25536] = "Targets";
	    EBMLId[EBMLId["TargetTypeValue"] = 26826] = "TargetTypeValue";
	    EBMLId[EBMLId["TargetType"] = 25546] = "TargetType";
	    EBMLId[EBMLId["TagTrackUID"] = 25541] = "TagTrackUID";
	    EBMLId[EBMLId["TagEditionUID"] = 25545] = "TagEditionUID";
	    EBMLId[EBMLId["TagChapterUID"] = 25540] = "TagChapterUID";
	    EBMLId[EBMLId["TagAttachmentUID"] = 25542] = "TagAttachmentUID";
	    EBMLId[EBMLId["SimpleTag"] = 26568] = "SimpleTag";
	    EBMLId[EBMLId["TagName"] = 17827] = "TagName";
	    EBMLId[EBMLId["TagLanguage"] = 17530] = "TagLanguage";
	    EBMLId[EBMLId["TagString"] = 17543] = "TagString";
	    EBMLId[EBMLId["TagBinary"] = 17541] = "TagBinary";
	    EBMLId[EBMLId["ContentEncodings"] = 28032] = "ContentEncodings";
	    EBMLId[EBMLId["ContentEncoding"] = 25152] = "ContentEncoding";
	    EBMLId[EBMLId["ContentEncodingOrder"] = 20529] = "ContentEncodingOrder";
	    EBMLId[EBMLId["ContentEncodingScope"] = 20530] = "ContentEncodingScope";
	    EBMLId[EBMLId["ContentCompression"] = 20532] = "ContentCompression";
	    EBMLId[EBMLId["ContentCompAlgo"] = 16980] = "ContentCompAlgo";
	    EBMLId[EBMLId["ContentCompSettings"] = 16981] = "ContentCompSettings";
	    EBMLId[EBMLId["ContentEncryption"] = 20533] = "ContentEncryption";
	})(EBMLId || (EBMLId = {}));
	[
	    EBMLId.EBML,
	    EBMLId.Segment,
	];
	// All the stuff that can appear in a segment, basically
	[
	    EBMLId.SeekHead,
	    EBMLId.Info,
	    EBMLId.Cluster,
	    EBMLId.Tracks,
	    EBMLId.Cues,
	    EBMLId.Attachments,
	    EBMLId.Chapters,
	    EBMLId.Tags,
	];
	const measureUnsignedInt = (value) => {
	    if (value < (1 << 8)) {
	        return 1;
	    }
	    else if (value < (1 << 16)) {
	        return 2;
	    }
	    else if (value < (1 << 24)) {
	        return 3;
	    }
	    else if (value < 2 ** 32) {
	        return 4;
	    }
	    else if (value < 2 ** 40) {
	        return 5;
	    }
	    else {
	        return 6;
	    }
	};
	const measureUnsignedBigInt = (value) => {
	    if (value < (1n << 8n)) {
	        return 1;
	    }
	    else if (value < (1n << 16n)) {
	        return 2;
	    }
	    else if (value < (1n << 24n)) {
	        return 3;
	    }
	    else if (value < (1n << 32n)) {
	        return 4;
	    }
	    else if (value < (1n << 40n)) {
	        return 5;
	    }
	    else if (value < (1n << 48n)) {
	        return 6;
	    }
	    else if (value < (1n << 56n)) {
	        return 7;
	    }
	    else {
	        return 8;
	    }
	};
	const measureSignedInt = (value) => {
	    if (value >= -64 && value < (1 << 6)) {
	        return 1;
	    }
	    else if (value >= -8192 && value < (1 << 13)) {
	        return 2;
	    }
	    else if (value >= -1048576 && value < (1 << 20)) {
	        return 3;
	    }
	    else if (value >= -134217728 && value < (1 << 27)) {
	        return 4;
	    }
	    else if (value >= -17179869184 && value < 2 ** 34) {
	        return 5;
	    }
	    else {
	        return 6;
	    }
	};
	const measureVarInt = (value) => {
	    if (value < (1 << 7) - 1) {
	        /** Top bit is set, leaving 7 bits to hold the integer, but we can't store
	         * 127 because "all bits set to one" is a reserved value. Same thing for the
	         * other cases below:
	         */
	        return 1;
	    }
	    else if (value < (1 << 14) - 1) {
	        return 2;
	    }
	    else if (value < (1 << 21) - 1) {
	        return 3;
	    }
	    else if (value < (1 << 28) - 1) {
	        return 4;
	    }
	    else if (value < 2 ** 35 - 1) {
	        return 5;
	    }
	    else if (value < 2 ** 42 - 1) {
	        return 6;
	    }
	    else {
	        throw new Error('EBML varint size not supported ' + value);
	    }
	};
	class EBMLWriter {
	    constructor(writer) {
	        this.writer = writer;
	        this.helper = new Uint8Array(8);
	        this.helperView = new DataView(this.helper.buffer);
	        /**
	         * Stores the position from the start of the file to where EBML elements have been written. This is used to
	         * rewrite/edit elements that were already added before, and to measure sizes of things.
	         */
	        this.offsets = new WeakMap();
	        /** Same as offsets, but stores position where the element's data starts (after ID and size fields). */
	        this.dataOffsets = new WeakMap();
	    }
	    writeByte(value) {
	        this.helperView.setUint8(0, value);
	        this.writer.write(this.helper.subarray(0, 1));
	    }
	    writeFloat32(value) {
	        this.helperView.setFloat32(0, value, false);
	        this.writer.write(this.helper.subarray(0, 4));
	    }
	    writeFloat64(value) {
	        this.helperView.setFloat64(0, value, false);
	        this.writer.write(this.helper);
	    }
	    writeUnsignedInt(value, width = measureUnsignedInt(value)) {
	        let pos = 0;
	        // Each case falls through:
	        switch (width) {
	            case 6:
	                // Need to use division to access >32 bits of floating point var
	                this.helperView.setUint8(pos++, (value / 2 ** 40) | 0);
	            // eslint-disable-next-line no-fallthrough
	            case 5:
	                this.helperView.setUint8(pos++, (value / 2 ** 32) | 0);
	            // eslint-disable-next-line no-fallthrough
	            case 4:
	                this.helperView.setUint8(pos++, value >> 24);
	            // eslint-disable-next-line no-fallthrough
	            case 3:
	                this.helperView.setUint8(pos++, value >> 16);
	            // eslint-disable-next-line no-fallthrough
	            case 2:
	                this.helperView.setUint8(pos++, value >> 8);
	            // eslint-disable-next-line no-fallthrough
	            case 1:
	                this.helperView.setUint8(pos++, value);
	                break;
	            default:
	                throw new Error('Bad unsigned int size ' + width);
	        }
	        this.writer.write(this.helper.subarray(0, pos));
	    }
	    writeUnsignedBigInt(value, width = measureUnsignedBigInt(value)) {
	        let pos = 0;
	        for (let i = width - 1; i >= 0; i--) {
	            this.helperView.setUint8(pos++, Number((value >> BigInt(i * 8)) & 0xffn));
	        }
	        this.writer.write(this.helper.subarray(0, pos));
	    }
	    writeSignedInt(value, width = measureSignedInt(value)) {
	        if (value < 0) {
	            // Two's complement stuff
	            value += 2 ** (width * 8);
	        }
	        this.writeUnsignedInt(value, width);
	    }
	    writeVarInt(value, width = measureVarInt(value)) {
	        let pos = 0;
	        switch (width) {
	            case 1:
	                this.helperView.setUint8(pos++, (1 << 7) | value);
	                break;
	            case 2:
	                this.helperView.setUint8(pos++, (1 << 6) | (value >> 8));
	                this.helperView.setUint8(pos++, value);
	                break;
	            case 3:
	                this.helperView.setUint8(pos++, (1 << 5) | (value >> 16));
	                this.helperView.setUint8(pos++, value >> 8);
	                this.helperView.setUint8(pos++, value);
	                break;
	            case 4:
	                this.helperView.setUint8(pos++, (1 << 4) | (value >> 24));
	                this.helperView.setUint8(pos++, value >> 16);
	                this.helperView.setUint8(pos++, value >> 8);
	                this.helperView.setUint8(pos++, value);
	                break;
	            case 5:
	                /**
	                 * JavaScript converts its doubles to 32-bit integers for bitwise
	                 * operations, so we need to do a division by 2^32 instead of a
	                 * right-shift of 32 to retain those top 3 bits
	                 */
	                this.helperView.setUint8(pos++, (1 << 3) | ((value / 2 ** 32) & 0x7));
	                this.helperView.setUint8(pos++, value >> 24);
	                this.helperView.setUint8(pos++, value >> 16);
	                this.helperView.setUint8(pos++, value >> 8);
	                this.helperView.setUint8(pos++, value);
	                break;
	            case 6:
	                this.helperView.setUint8(pos++, (1 << 2) | ((value / 2 ** 40) & 0x3));
	                this.helperView.setUint8(pos++, (value / 2 ** 32) | 0);
	                this.helperView.setUint8(pos++, value >> 24);
	                this.helperView.setUint8(pos++, value >> 16);
	                this.helperView.setUint8(pos++, value >> 8);
	                this.helperView.setUint8(pos++, value);
	                break;
	            default:
	                throw new Error('Bad EBML varint size ' + width);
	        }
	        this.writer.write(this.helper.subarray(0, pos));
	    }
	    writeAsciiString(str) {
	        this.writer.write(new Uint8Array(str.split('').map(x => x.charCodeAt(0))));
	    }
	    writeEBML(data) {
	        if (data === null)
	            return;
	        if (data instanceof Uint8Array) {
	            this.writer.write(data);
	        }
	        else if (Array.isArray(data)) {
	            for (const elem of data) {
	                this.writeEBML(elem);
	            }
	        }
	        else {
	            this.offsets.set(data, this.writer.getPos());
	            this.writeUnsignedInt(data.id); // ID field
	            if (Array.isArray(data.data)) {
	                const sizePos = this.writer.getPos();
	                const sizeSize = data.size === -1 ? 1 : (data.size ?? 4);
	                if (data.size === -1) {
	                    // Write the reserved all-one-bits marker for unknown/unbounded size.
	                    this.writeByte(0xff);
	                }
	                else {
	                    this.writer.seek(this.writer.getPos() + sizeSize);
	                }
	                const startPos = this.writer.getPos();
	                this.dataOffsets.set(data, startPos);
	                this.writeEBML(data.data);
	                if (data.size !== -1) {
	                    const size = this.writer.getPos() - startPos;
	                    const endPos = this.writer.getPos();
	                    this.writer.seek(sizePos);
	                    this.writeVarInt(size, sizeSize);
	                    this.writer.seek(endPos);
	                }
	            }
	            else if (typeof data.data === 'number') {
	                const size = data.size ?? measureUnsignedInt(data.data);
	                this.writeVarInt(size);
	                this.writeUnsignedInt(data.data, size);
	            }
	            else if (typeof data.data === 'bigint') {
	                const size = data.size ?? measureUnsignedBigInt(data.data);
	                this.writeVarInt(size);
	                this.writeUnsignedBigInt(data.data, size);
	            }
	            else if (typeof data.data === 'string') {
	                this.writeVarInt(data.data.length);
	                this.writeAsciiString(data.data);
	            }
	            else if (data.data instanceof Uint8Array) {
	                this.writeVarInt(data.data.byteLength, data.size);
	                this.writer.write(data.data);
	            }
	            else if (data.data instanceof EBMLFloat32) {
	                this.writeVarInt(4);
	                this.writeFloat32(data.data.value);
	            }
	            else if (data.data instanceof EBMLFloat64) {
	                this.writeVarInt(8);
	                this.writeFloat64(data.data.value);
	            }
	            else if (data.data instanceof EBMLSignedInt) {
	                const size = data.size ?? measureSignedInt(data.data.value);
	                this.writeVarInt(size);
	                this.writeSignedInt(data.data.value, size);
	            }
	            else if (data.data instanceof EBMLUnicodeString) {
	                const bytes = textEncoder.encode(data.data.value);
	                this.writeVarInt(bytes.length);
	                this.writer.write(bytes);
	            }
	            else {
	                assertNever(data.data);
	            }
	        }
	    }
	}
	const CODEC_STRING_MAP = {
	    'avc': 'V_MPEG4/ISO/AVC',
	    'hevc': 'V_MPEGH/ISO/HEVC',
	    'vp8': 'V_VP8',
	    'vp9': 'V_VP9',
	    'av1': 'V_AV1',
	    'aac': 'A_AAC',
	    'mp3': 'A_MPEG/L3',
	    'opus': 'A_OPUS',
	    'vorbis': 'A_VORBIS',
	    'flac': 'A_FLAC',
	    'pcm-u8': 'A_PCM/INT/LIT',
	    'pcm-s16': 'A_PCM/INT/LIT',
	    'pcm-s16be': 'A_PCM/INT/BIG',
	    'pcm-s24': 'A_PCM/INT/LIT',
	    'pcm-s24be': 'A_PCM/INT/BIG',
	    'pcm-s32': 'A_PCM/INT/LIT',
	    'pcm-s32be': 'A_PCM/INT/BIG',
	    'pcm-f32': 'A_PCM/FLOAT/IEEE',
	    'pcm-f64': 'A_PCM/FLOAT/IEEE',
	    'webvtt': 'S_TEXT/WEBVTT',
	};

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	const buildMatroskaMimeType = (info) => {
	    const base = info.hasVideo
	        ? 'video/'
	        : info.hasAudio
	            ? 'audio/'
	            : 'application/';
	    let string = base + (info.isWebM ? 'webm' : 'x-matroska');
	    if (info.codecStrings.length > 0) {
	        const uniqueCodecMimeTypes = [...new Set(info.codecStrings.filter(Boolean))];
	        string += `; codecs="${uniqueCodecMimeTypes.join(', ')}"`;
	    }
	    return string;
	};

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	const inlineTimestampRegex = /<(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})>/g;
	const timestampRegex = /(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})/;
	const parseSubtitleTimestamp = (string) => {
	    const match = timestampRegex.exec(string);
	    if (!match)
	        throw new Error('Expected match.');
	    return 60 * 60 * 1000 * Number(match[1] || '0')
	        + 60 * 1000 * Number(match[2])
	        + 1000 * Number(match[3])
	        + Number(match[4]);
	};
	const formatSubtitleTimestamp = (timestamp) => {
	    const hours = Math.floor(timestamp / (60 * 60 * 1000));
	    const minutes = Math.floor((timestamp % (60 * 60 * 1000)) / (60 * 1000));
	    const seconds = Math.floor((timestamp % (60 * 1000)) / 1000);
	    const milliseconds = timestamp % 1000;
	    return hours.toString().padStart(2, '0') + ':'
	        + minutes.toString().padStart(2, '0') + ':'
	        + seconds.toString().padStart(2, '0') + '.'
	        + milliseconds.toString().padStart(3, '0');
	};

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	class IsobmffBoxWriter {
	    constructor(writer) {
	        this.writer = writer;
	        this.helper = new Uint8Array(8);
	        this.helperView = new DataView(this.helper.buffer);
	        /**
	         * Stores the position from the start of the file to where boxes elements have been written. This is used to
	         * rewrite/edit elements that were already added before, and to measure sizes of things.
	         */
	        this.offsets = new WeakMap();
	    }
	    writeU32(value) {
	        this.helperView.setUint32(0, value, false);
	        this.writer.write(this.helper.subarray(0, 4));
	    }
	    writeU64(value) {
	        this.helperView.setUint32(0, Math.floor(value / 2 ** 32), false);
	        this.helperView.setUint32(4, value, false);
	        this.writer.write(this.helper.subarray(0, 8));
	    }
	    writeAscii(text) {
	        for (let i = 0; i < text.length; i++) {
	            this.helperView.setUint8(i % 8, text.charCodeAt(i));
	            if (i % 8 === 7)
	                this.writer.write(this.helper);
	        }
	        if (text.length % 8 !== 0) {
	            this.writer.write(this.helper.subarray(0, text.length % 8));
	        }
	    }
	    writeBox(box) {
	        this.offsets.set(box, this.writer.getPos());
	        if (box.contents && !box.children) {
	            this.writeBoxHeader(box, box.size ?? box.contents.byteLength + 8);
	            this.writer.write(box.contents);
	        }
	        else {
	            const startPos = this.writer.getPos();
	            this.writeBoxHeader(box, 0);
	            if (box.contents)
	                this.writer.write(box.contents);
	            if (box.children)
	                for (const child of box.children)
	                    if (child)
	                        this.writeBox(child);
	            const endPos = this.writer.getPos();
	            const size = box.size ?? endPos - startPos;
	            this.writer.seek(startPos);
	            this.writeBoxHeader(box, size);
	            this.writer.seek(endPos);
	        }
	    }
	    writeBoxHeader(box, size) {
	        this.writeU32(box.largeSize ? 1 : size);
	        this.writeAscii(box.type);
	        if (box.largeSize)
	            this.writeU64(size);
	    }
	    measureBoxHeader(box) {
	        return 8 + (box.largeSize ? 8 : 0);
	    }
	    patchBox(box) {
	        const boxOffset = this.offsets.get(box);
	        assert(boxOffset !== undefined);
	        const endPos = this.writer.getPos();
	        this.writer.seek(boxOffset);
	        this.writeBox(box);
	        this.writer.seek(endPos);
	    }
	    measureBox(box) {
	        if (box.contents && !box.children) {
	            const headerSize = this.measureBoxHeader(box);
	            return headerSize + box.contents.byteLength;
	        }
	        else {
	            let result = this.measureBoxHeader(box);
	            if (box.contents)
	                result += box.contents.byteLength;
	            if (box.children)
	                for (const child of box.children)
	                    if (child)
	                        result += this.measureBox(child);
	            return result;
	        }
	    }
	}
	const bytes = new Uint8Array(8);
	const view = new DataView(bytes.buffer);
	const u8 = (value) => {
	    return [(value % 0x100 + 0x100) % 0x100];
	};
	const u16 = (value) => {
	    view.setUint16(0, value, false);
	    return [bytes[0], bytes[1]];
	};
	const i16 = (value) => {
	    view.setInt16(0, value, false);
	    return [bytes[0], bytes[1]];
	};
	const u24 = (value) => {
	    view.setUint32(0, value, false);
	    return [bytes[1], bytes[2], bytes[3]];
	};
	const u32 = (value) => {
	    view.setUint32(0, value, false);
	    return [bytes[0], bytes[1], bytes[2], bytes[3]];
	};
	const i32 = (value) => {
	    view.setInt32(0, value, false);
	    return [bytes[0], bytes[1], bytes[2], bytes[3]];
	};
	const u64 = (value) => {
	    view.setUint32(0, Math.floor(value / 2 ** 32), false);
	    view.setUint32(4, value, false);
	    return [bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]];
	};
	const fixed_8_8 = (value) => {
	    view.setInt16(0, 2 ** 8 * value, false);
	    return [bytes[0], bytes[1]];
	};
	const fixed_16_16 = (value) => {
	    view.setInt32(0, 2 ** 16 * value, false);
	    return [bytes[0], bytes[1], bytes[2], bytes[3]];
	};
	const fixed_2_30 = (value) => {
	    view.setInt32(0, 2 ** 30 * value, false);
	    return [bytes[0], bytes[1], bytes[2], bytes[3]];
	};
	const variableUnsignedInt = (value, byteLength) => {
	    const bytes = [];
	    let remaining = value;
	    do {
	        let byte = remaining & 0x7f;
	        remaining >>= 7;
	        // If this isn't the first byte we're adding (meaning there will be more bytes after it
	        // when we reverse the array), set the continuation bit
	        if (bytes.length > 0) {
	            byte |= 0x80;
	        }
	        bytes.push(byte);
	    } while (remaining > 0 || byteLength);
	    // Reverse the array since we built it backwards
	    return bytes.reverse();
	};
	const ascii = (text, nullTerminated = false) => {
	    const bytes = Array(text.length).fill(null).map((_, i) => text.charCodeAt(i));
	    if (nullTerminated)
	        bytes.push(0x00);
	    return bytes;
	};
	const lastPresentedSample = (samples) => {
	    let result = null;
	    for (const sample of samples) {
	        if (!result || sample.timestamp > result.timestamp) {
	            result = sample;
	        }
	    }
	    return result;
	};
	const rotationMatrix = (rotationInDegrees) => {
	    const theta = rotationInDegrees * (Math.PI / 180);
	    const cosTheta = Math.round(Math.cos(theta));
	    const sinTheta = Math.round(Math.sin(theta));
	    // Matrices are post-multiplied in ISOBMFF, meaning this is the transpose of your typical rotation matrix
	    return [
	        cosTheta, sinTheta, 0,
	        -sinTheta, cosTheta, 0,
	        0, 0, 1,
	    ];
	};
	const IDENTITY_MATRIX = rotationMatrix(0);
	const matrixToBytes = (matrix) => {
	    return [
	        fixed_16_16(matrix[0]), fixed_16_16(matrix[1]), fixed_2_30(matrix[2]),
	        fixed_16_16(matrix[3]), fixed_16_16(matrix[4]), fixed_2_30(matrix[5]),
	        fixed_16_16(matrix[6]), fixed_16_16(matrix[7]), fixed_2_30(matrix[8]),
	    ];
	};
	const box = (type, contents, children) => ({
	    type,
	    contents: contents && new Uint8Array(contents.flat(10)),
	    children,
	});
	/** A FullBox always starts with a version byte, followed by three flag bytes. */
	const fullBox = (type, version, flags, contents, children) => box(type, [u8(version), u24(flags), contents ?? []], children);
	/**
	 * File Type Compatibility Box: Allows the reader to determine whether this is a type of file that the
	 * reader understands.
	 */
	const ftyp = (details) => {
	    // You can find the full logic for this at
	    // https://github.com/FFmpeg/FFmpeg/blob/de2fb43e785773738c660cdafb9309b1ef1bc80d/libavformat/movenc.c#L5518
	    // Obviously, this lib only needs a small subset of that logic.
	    const minorVersion = 0x200;
	    if (details.isQuickTime) {
	        return box('ftyp', [
	            ascii('qt  '), // Major brand
	            u32(minorVersion), // Minor version
	            // Compatible brands
	            ascii('qt  '),
	        ]);
	    }
	    if (details.fragmented) {
	        return box('ftyp', [
	            ascii('iso5'), // Major brand
	            u32(minorVersion), // Minor version
	            // Compatible brands
	            ascii('iso5'),
	            ascii('iso6'),
	            ascii('mp41'),
	        ]);
	    }
	    return box('ftyp', [
	        ascii('isom'), // Major brand
	        u32(minorVersion), // Minor version
	        // Compatible brands
	        ascii('isom'),
	        details.holdsAvc ? ascii('avc1') : [],
	        ascii('mp41'),
	    ]);
	};
	/** Movie Sample Data Box. Contains the actual frames/samples of the media. */
	const mdat = (reserveLargeSize) => ({ type: 'mdat', largeSize: reserveLargeSize });
	/** Free Space Box: A box that designates unused space in the movie data file. */
	const free = (size) => ({ type: 'free', size });
	/**
	 * Movie Box: Used to specify the information that defines a movie - that is, the information that allows
	 * an application to interpret the sample data that is stored elsewhere.
	 */
	const moov = (muxer) => box('moov', undefined, [
	    mvhd(muxer.creationTime, muxer.trackDatas),
	    ...muxer.trackDatas.map(x => trak(x, muxer.creationTime)),
	    muxer.isFragmented ? mvex(muxer.trackDatas) : null,
	    udta(muxer),
	]);
	/** Movie Header Box: Used to specify the characteristics of the entire movie, such as timescale and duration. */
	const mvhd = (creationTime, trackDatas) => {
	    const duration = intoTimescale(Math.max(0, ...trackDatas
	        .filter(x => x.samples.length > 0)
	        .map((x) => {
	        const lastSample = lastPresentedSample(x.samples);
	        return lastSample.timestamp + lastSample.duration;
	    })), GLOBAL_TIMESCALE);
	    const nextTrackId = Math.max(0, ...trackDatas.map(x => x.track.id)) + 1;
	    // Conditionally use u64 if u32 isn't enough
	    const needsU64 = !isU32(creationTime) || !isU32(duration);
	    const u32OrU64 = needsU64 ? u64 : u32;
	    return fullBox('mvhd', +needsU64, 0, [
	        u32OrU64(creationTime), // Creation time
	        u32OrU64(creationTime), // Modification time
	        u32(GLOBAL_TIMESCALE), // Timescale
	        u32OrU64(duration), // Duration
	        fixed_16_16(1), // Preferred rate
	        fixed_8_8(1), // Preferred volume
	        Array(10).fill(0), // Reserved
	        matrixToBytes(IDENTITY_MATRIX), // Matrix
	        Array(24).fill(0), // Pre-defined
	        u32(nextTrackId), // Next track ID
	    ]);
	};
	/**
	 * Track Box: Defines a single track of a movie. A movie may consist of one or more tracks. Each track is
	 * independent of the other tracks in the movie and carries its own temporal and spatial information. Each Track Box
	 * contains its associated Media Box.
	 */
	const trak = (trackData, creationTime) => {
	    const trackMetadata = getTrackMetadata(trackData);
	    return box('trak', undefined, [
	        tkhd(trackData, creationTime),
	        mdia(trackData, creationTime),
	        trackMetadata.name !== undefined
	            ? box('udta', undefined, [
	                box('name', [
	                    ...textEncoder.encode(trackMetadata.name),
	                ]),
	            ])
	            : null,
	    ]);
	};
	/** Track Header Box: Specifies the characteristics of a single track within a movie. */
	const tkhd = (trackData, creationTime) => {
	    const lastSample = lastPresentedSample(trackData.samples);
	    const durationInGlobalTimescale = intoTimescale(lastSample ? lastSample.timestamp + lastSample.duration : 0, GLOBAL_TIMESCALE);
	    const needsU64 = !isU32(creationTime) || !isU32(durationInGlobalTimescale);
	    const u32OrU64 = needsU64 ? u64 : u32;
	    let matrix;
	    if (trackData.type === 'video') {
	        const rotation = trackData.track.metadata.rotation;
	        matrix = rotationMatrix(rotation ?? 0);
	    }
	    else {
	        matrix = IDENTITY_MATRIX;
	    }
	    return fullBox('tkhd', +needsU64, 3, [
	        u32OrU64(creationTime), // Creation time
	        u32OrU64(creationTime), // Modification time
	        u32(trackData.track.id), // Track ID
	        u32(0), // Reserved
	        u32OrU64(durationInGlobalTimescale), // Duration
	        Array(8).fill(0), // Reserved
	        u16(0), // Layer
	        u16(trackData.track.id), // Alternate group
	        fixed_8_8(trackData.type === 'audio' ? 1 : 0), // Volume
	        u16(0), // Reserved
	        matrixToBytes(matrix), // Matrix
	        fixed_16_16(trackData.type === 'video' ? trackData.info.width : 0), // Track width
	        fixed_16_16(trackData.type === 'video' ? trackData.info.height : 0), // Track height
	    ]);
	};
	/** Media Box: Describes and define a track's media type and sample data. */
	const mdia = (trackData, creationTime) => box('mdia', undefined, [
	    mdhd(trackData, creationTime),
	    hdlr(true, TRACK_TYPE_TO_COMPONENT_SUBTYPE[trackData.type], TRACK_TYPE_TO_HANDLER_NAME[trackData.type]),
	    minf(trackData),
	]);
	/** Media Header Box: Specifies the characteristics of a media, including timescale and duration. */
	const mdhd = (trackData, creationTime) => {
	    const lastSample = lastPresentedSample(trackData.samples);
	    const localDuration = intoTimescale(lastSample ? lastSample.timestamp + lastSample.duration : 0, trackData.timescale);
	    const needsU64 = !isU32(creationTime) || !isU32(localDuration);
	    const u32OrU64 = needsU64 ? u64 : u32;
	    return fullBox('mdhd', +needsU64, 0, [
	        u32OrU64(creationTime), // Creation time
	        u32OrU64(creationTime), // Modification time
	        u32(trackData.timescale), // Timescale
	        u32OrU64(localDuration), // Duration
	        u16(getLanguageCodeInt(trackData.track.metadata.languageCode ?? UNDETERMINED_LANGUAGE)), // Language
	        u16(0), // Quality
	    ]);
	};
	const TRACK_TYPE_TO_COMPONENT_SUBTYPE = {
	    video: 'vide',
	    audio: 'soun',
	    subtitle: 'text',
	};
	const TRACK_TYPE_TO_HANDLER_NAME = {
	    video: 'MediabunnyVideoHandler',
	    audio: 'MediabunnySoundHandler',
	    subtitle: 'MediabunnyTextHandler',
	};
	/** Handler Reference Box. */
	const hdlr = (hasComponentType, handlerType, name, manufacturer = '\0\0\0\0') => fullBox('hdlr', 0, 0, [
	    hasComponentType ? ascii('mhlr') : u32(0), // Component type
	    ascii(handlerType), // Component subtype
	    ascii(manufacturer), // Component manufacturer
	    u32(0), // Component flags
	    u32(0), // Component flags mask
	    ascii(name, true), // Component name
	]);
	/**
	 * Media Information Box: Stores handler-specific information for a track's media data. The media handler uses this
	 * information to map from media time to media data and to process the media data.
	 */
	const minf = (trackData) => box('minf', undefined, [
	    TRACK_TYPE_TO_HEADER_BOX[trackData.type](),
	    dinf(),
	    stbl(trackData),
	]);
	/** Video Media Information Header Box: Defines specific color and graphics mode information. */
	const vmhd = () => fullBox('vmhd', 0, 1, [
	    u16(0), // Graphics mode
	    u16(0), // Opcolor R
	    u16(0), // Opcolor G
	    u16(0), // Opcolor B
	]);
	/** Sound Media Information Header Box: Stores the sound media's control information, such as balance. */
	const smhd = () => fullBox('smhd', 0, 0, [
	    u16(0), // Balance
	    u16(0), // Reserved
	]);
	/** Null Media Header Box. */
	const nmhd = () => fullBox('nmhd', 0, 0);
	const TRACK_TYPE_TO_HEADER_BOX = {
	    video: vmhd,
	    audio: smhd,
	    subtitle: nmhd,
	};
	/**
	 * Data Information Box: Contains information specifying the data handler component that provides access to the
	 * media data. The data handler component uses the Data Information Box to interpret the media's data.
	 */
	const dinf = () => box('dinf', undefined, [
	    dref(),
	]);
	/**
	 * Data Reference Box: Contains tabular data that instructs the data handler component how to access the media's data.
	 */
	const dref = () => fullBox('dref', 0, 0, [
	    u32(1), // Entry count
	], [
	    url(),
	]);
	const url = () => fullBox('url ', 0, 1); // Self-reference flag enabled
	/**
	 * Sample Table Box: Contains information for converting from media time to sample number to sample location. This box
	 * also indicates how to interpret the sample (for example, whether to decompress the video data and, if so, how).
	 */
	const stbl = (trackData) => {
	    const needsCtts = trackData.compositionTimeOffsetTable.length > 1
	        || trackData.compositionTimeOffsetTable.some(x => x.sampleCompositionTimeOffset !== 0);
	    return box('stbl', undefined, [
	        stsd(trackData),
	        stts(trackData),
	        needsCtts ? ctts(trackData) : null,
	        needsCtts ? cslg(trackData) : null,
	        stsc(trackData),
	        stsz(trackData),
	        stco(trackData),
	        stss(trackData),
	    ]);
	};
	/**
	 * Sample Description Box: Stores information that allows you to decode samples in the media. The data stored in the
	 * sample description varies, depending on the media type.
	 */
	const stsd = (trackData) => {
	    let sampleDescription;
	    if (trackData.type === 'video') {
	        sampleDescription = videoSampleDescription(VIDEO_CODEC_TO_BOX_NAME[trackData.track.source._codec], trackData);
	    }
	    else if (trackData.type === 'audio') {
	        const boxName = audioCodecToBoxName(trackData.track.source._codec, trackData.muxer.isQuickTime);
	        assert(boxName);
	        sampleDescription = soundSampleDescription(boxName, trackData);
	    }
	    else if (trackData.type === 'subtitle') {
	        sampleDescription = subtitleSampleDescription(SUBTITLE_CODEC_TO_BOX_NAME[trackData.track.source._codec], trackData);
	    }
	    assert(sampleDescription);
	    return fullBox('stsd', 0, 0, [
	        u32(1), // Entry count
	    ], [
	        sampleDescription,
	    ]);
	};
	/** Video Sample Description Box: Contains information that defines how to interpret video media data. */
	const videoSampleDescription = (compressionType, trackData) => box(compressionType, [
	    Array(6).fill(0), // Reserved
	    u16(1), // Data reference index
	    u16(0), // Pre-defined
	    u16(0), // Reserved
	    Array(12).fill(0), // Pre-defined
	    u16(trackData.info.width), // Width
	    u16(trackData.info.height), // Height
	    u32(0x00480000), // Horizontal resolution
	    u32(0x00480000), // Vertical resolution
	    u32(0), // Reserved
	    u16(1), // Frame count
	    Array(32).fill(0), // Compressor name
	    u16(0x0018), // Depth
	    i16(0xffff), // Pre-defined
	], [
	    VIDEO_CODEC_TO_CONFIGURATION_BOX[trackData.track.source._codec](trackData),
	    colorSpaceIsComplete(trackData.info.decoderConfig.colorSpace) ? colr(trackData) : null,
	]);
	/** Colour Information Box: Specifies the color space of the video. */
	const colr = (trackData) => box('colr', [
	    ascii('nclx'), // Colour type
	    u16(COLOR_PRIMARIES_MAP[trackData.info.decoderConfig.colorSpace.primaries]), // Colour primaries
	    u16(TRANSFER_CHARACTERISTICS_MAP[trackData.info.decoderConfig.colorSpace.transfer]), // Transfer characteristics
	    u16(MATRIX_COEFFICIENTS_MAP[trackData.info.decoderConfig.colorSpace.matrix]), // Matrix coefficients
	    u8((trackData.info.decoderConfig.colorSpace.fullRange ? 1 : 0) << 7), // Full range flag
	]);
	/** AVC Configuration Box: Provides additional information to the decoder. */
	const avcC = (trackData) => trackData.info.decoderConfig && box('avcC', [
	    // For AVC, description is an AVCDecoderConfigurationRecord, so nothing else to do here
	    ...toUint8Array(trackData.info.decoderConfig.description),
	]);
	/** HEVC Configuration Box: Provides additional information to the decoder. */
	const hvcC = (trackData) => trackData.info.decoderConfig && box('hvcC', [
	    // For HEVC, description is an HEVCDecoderConfigurationRecord, so nothing else to do here
	    ...toUint8Array(trackData.info.decoderConfig.description),
	]);
	/** VP Configuration Box: Provides additional information to the decoder. */
	const vpcC = (trackData) => {
	    // Reference: https://www.webmproject.org/vp9/mp4/
	    if (!trackData.info.decoderConfig) {
	        return null;
	    }
	    const decoderConfig = trackData.info.decoderConfig;
	    const parts = decoderConfig.codec.split('.'); // We can derive the required values from the codec string
	    const profile = Number(parts[1]);
	    const level = Number(parts[2]);
	    const bitDepth = Number(parts[3]);
	    const chromaSubsampling = parts[4] ? Number(parts[4]) : 1; // 4:2:0 colocated with luma (0,0)
	    const videoFullRangeFlag = parts[8] ? Number(parts[8]) : Number(decoderConfig.colorSpace?.fullRange ?? 0);
	    const thirdByte = (bitDepth << 4) + (chromaSubsampling << 1) + videoFullRangeFlag;
	    const colourPrimaries = parts[5]
	        ? Number(parts[5])
	        : decoderConfig.colorSpace?.primaries
	            ? COLOR_PRIMARIES_MAP[decoderConfig.colorSpace.primaries]
	            : 2; // Default to undetermined
	    const transferCharacteristics = parts[6]
	        ? Number(parts[6])
	        : decoderConfig.colorSpace?.transfer
	            ? TRANSFER_CHARACTERISTICS_MAP[decoderConfig.colorSpace.transfer]
	            : 2;
	    const matrixCoefficients = parts[7]
	        ? Number(parts[7])
	        : decoderConfig.colorSpace?.matrix
	            ? MATRIX_COEFFICIENTS_MAP[decoderConfig.colorSpace.matrix]
	            : 2;
	    return fullBox('vpcC', 1, 0, [
	        u8(profile), // Profile
	        u8(level), // Level
	        u8(thirdByte), // Bit depth, chroma subsampling, full range
	        u8(colourPrimaries), // Colour primaries
	        u8(transferCharacteristics), // Transfer characteristics
	        u8(matrixCoefficients), // Matrix coefficients
	        u16(0), // Codec initialization data size
	    ]);
	};
	/** AV1 Configuration Box: Provides additional information to the decoder. */
	const av1C = (trackData) => {
	    return box('av1C', generateAv1CodecConfigurationFromCodecString(trackData.info.decoderConfig.codec));
	};
	/** Sound Sample Description Box: Contains information that defines how to interpret sound media data. */
	const soundSampleDescription = (compressionType, trackData) => {
	    let version = 0;
	    let contents;
	    let sampleSizeInBits = 16;
	    if (PCM_AUDIO_CODECS.includes(trackData.track.source._codec)) {
	        const codec = trackData.track.source._codec;
	        const { sampleSize } = parsePcmCodec(codec);
	        sampleSizeInBits = 8 * sampleSize;
	        if (sampleSizeInBits > 16) {
	            version = 1;
	        }
	    }
	    if (version === 0) {
	        contents = [
	            Array(6).fill(0), // Reserved
	            u16(1), // Data reference index
	            u16(version), // Version
	            u16(0), // Revision level
	            u32(0), // Vendor
	            u16(trackData.info.numberOfChannels), // Number of channels
	            u16(sampleSizeInBits), // Sample size (bits)
	            u16(0), // Compression ID
	            u16(0), // Packet size
	            u16(trackData.info.sampleRate < 2 ** 16 ? trackData.info.sampleRate : 0), // Sample rate (upper)
	            u16(0), // Sample rate (lower)
	        ];
	    }
	    else {
	        contents = [
	            Array(6).fill(0), // Reserved
	            u16(1), // Data reference index
	            u16(version), // Version
	            u16(0), // Revision level
	            u32(0), // Vendor
	            u16(trackData.info.numberOfChannels), // Number of channels
	            u16(Math.min(sampleSizeInBits, 16)), // Sample size (bits)
	            u16(0), // Compression ID
	            u16(0), // Packet size
	            u16(trackData.info.sampleRate < 2 ** 16 ? trackData.info.sampleRate : 0), // Sample rate (upper)
	            u16(0), // Sample rate (lower)
	            u32(1), // Samples per packet (must be 1 for uncompressed formats)
	            u32(sampleSizeInBits / 8), // Bytes per packet
	            u32(trackData.info.numberOfChannels * sampleSizeInBits / 8), // Bytes per frame
	            u32(2), // Bytes per sample (constant in FFmpeg)
	        ];
	    }
	    return box(compressionType, contents, [
	        audioCodecToConfigurationBox(trackData.track.source._codec, trackData.muxer.isQuickTime)?.(trackData) ?? null,
	    ]);
	};
	/** MPEG-4 Elementary Stream Descriptor Box. */
	const esds = (trackData) => {
	    // We build up the bytes in a layered way which reflects the nested structure
	    let objectTypeIndication;
	    switch (trackData.track.source._codec) {
	        case 'aac':
	            {
	                objectTypeIndication = 0x40;
	            }
	            break;
	        case 'mp3':
	            {
	                objectTypeIndication = 0x6b;
	            }
	            break;
	        case 'vorbis':
	            {
	                objectTypeIndication = 0xdd;
	            }
	            break;
	        default: throw new Error(`Unhandled audio codec: ${trackData.track.source._codec}`);
	    }
	    let bytes = [
	        ...u8(objectTypeIndication), // Object type indication
	        ...u8(0x15), // stream type(6bits)=5 audio, flags(2bits)=1
	        ...u24(0), // 24bit buffer size
	        ...u32(0), // max bitrate
	        ...u32(0), // avg bitrate
	    ];
	    if (trackData.info.decoderConfig.description) {
	        const description = toUint8Array(trackData.info.decoderConfig.description);
	        // Add the decoder description to the end
	        bytes = [
	            ...bytes,
	            ...u8(0x05), // TAG(5) = DecoderSpecificInfo
	            ...variableUnsignedInt(description.byteLength),
	            ...description,
	        ];
	    }
	    bytes = [
	        ...u16(1), // ES_ID = 1
	        ...u8(0x00), // flags etc = 0
	        ...u8(0x04), // TAG(4) = ES Descriptor
	        ...variableUnsignedInt(bytes.length),
	        ...bytes,
	        ...u8(0x06), // TAG(6)
	        ...u8(0x01), // length
	        ...u8(0x02), // data
	    ];
	    bytes = [
	        ...u8(0x03), // TAG(3) = Object Descriptor
	        ...variableUnsignedInt(bytes.length),
	        ...bytes,
	    ];
	    return fullBox('esds', 0, 0, bytes);
	};
	const wave = (trackData) => {
	    return box('wave', undefined, [
	        frma(trackData),
	        enda(trackData),
	        box('\x00\x00\x00\x00'), // NULL tag at the end
	    ]);
	};
	const frma = (trackData) => {
	    return box('frma', [
	        ascii(audioCodecToBoxName(trackData.track.source._codec, trackData.muxer.isQuickTime)),
	    ]);
	};
	// This box specifies PCM endianness
	const enda = (trackData) => {
	    const { littleEndian } = parsePcmCodec(trackData.track.source._codec);
	    return box('enda', [
	        u16(+littleEndian),
	    ]);
	};
	/** Opus Specific Box. */
	const dOps = (trackData) => {
	    let outputChannelCount = trackData.info.numberOfChannels;
	    // Default PreSkip, should be at least 80 milliseconds worth of playback, measured in 48000 Hz samples
	    let preSkip = 3840;
	    let inputSampleRate = trackData.info.sampleRate;
	    let outputGain = 0;
	    let channelMappingFamily = 0;
	    let channelMappingTable = new Uint8Array(0);
	    // Read preskip and from codec private data from the encoder
	    // https://www.rfc-editor.org/rfc/rfc7845#section-5
	    const description = trackData.info.decoderConfig?.description;
	    if (description) {
	        assert(description.byteLength >= 18);
	        const bytes = toUint8Array(description);
	        const header = parseOpusIdentificationHeader(bytes);
	        outputChannelCount = header.outputChannelCount;
	        preSkip = header.preSkip;
	        inputSampleRate = header.inputSampleRate;
	        outputGain = header.outputGain;
	        channelMappingFamily = header.channelMappingFamily;
	        if (header.channelMappingTable) {
	            channelMappingTable = header.channelMappingTable;
	        }
	    }
	    // https://www.opus-codec.org/docs/opus_in_isobmff.html
	    return box('dOps', [
	        u8(0), // Version
	        u8(outputChannelCount), // OutputChannelCount
	        u16(preSkip), // PreSkip
	        u32(inputSampleRate), // InputSampleRate
	        i16(outputGain), // OutputGain
	        u8(channelMappingFamily), // ChannelMappingFamily
	        ...channelMappingTable,
	    ]);
	};
	/** FLAC specific box. */
	const dfLa = (trackData) => {
	    const description = trackData.info.decoderConfig?.description;
	    assert(description);
	    const bytes = toUint8Array(description);
	    return fullBox('dfLa', 0, 0, [
	        ...bytes.subarray(4),
	    ]);
	};
	/** PCM Configuration Box, ISO/IEC 23003-5. */
	const pcmC = (trackData) => {
	    const { littleEndian, sampleSize } = parsePcmCodec(trackData.track.source._codec);
	    const formatFlags = +littleEndian;
	    return fullBox('pcmC', 0, 0, [
	        u8(formatFlags),
	        u8(8 * sampleSize),
	    ]);
	};
	const subtitleSampleDescription = (compressionType, trackData) => box(compressionType, [
	    Array(6).fill(0), // Reserved
	    u16(1), // Data reference index
	], [
	    SUBTITLE_CODEC_TO_CONFIGURATION_BOX[trackData.track.source._codec](trackData),
	]);
	const vttC = (trackData) => box('vttC', [
	    ...textEncoder.encode(trackData.info.config.description),
	]);
	/**
	 * Time-To-Sample Box: Stores duration information for a media's samples, providing a mapping from a time in a media
	 * to the corresponding data sample. The table is compact, meaning that consecutive samples with the same time delta
	 * will be grouped.
	 */
	const stts = (trackData) => {
	    return fullBox('stts', 0, 0, [
	        u32(trackData.timeToSampleTable.length), // Number of entries
	        trackData.timeToSampleTable.map(x => [
	            u32(x.sampleCount), // Sample count
	            u32(x.sampleDelta), // Sample duration
	        ]),
	    ]);
	};
	/** Sync Sample Box: Identifies the key frames in the media, marking the random access points within a stream. */
	const stss = (trackData) => {
	    if (trackData.samples.every(x => x.type === 'key'))
	        return null; // No stss box -> every frame is a key frame
	    const keySamples = [...trackData.samples.entries()].filter(([, sample]) => sample.type === 'key');
	    return fullBox('stss', 0, 0, [
	        u32(keySamples.length), // Number of entries
	        keySamples.map(([index]) => u32(index + 1)), // Sync sample table
	    ]);
	};
	/**
	 * Sample-To-Chunk Box: As samples are added to a media, they are collected into chunks that allow optimized data
	 * access. A chunk contains one or more samples. Chunks in a media may have different sizes, and the samples within a
	 * chunk may have different sizes. The Sample-To-Chunk Box stores chunk information for the samples in a media, stored
	 * in a compactly-coded fashion.
	 */
	const stsc = (trackData) => {
	    return fullBox('stsc', 0, 0, [
	        u32(trackData.compactlyCodedChunkTable.length), // Number of entries
	        trackData.compactlyCodedChunkTable.map(x => [
	            u32(x.firstChunk), // First chunk
	            u32(x.samplesPerChunk), // Samples per chunk
	            u32(1), // Sample description index
	        ]),
	    ]);
	};
	/** Sample Size Box: Specifies the byte size of each sample in the media. */
	const stsz = (trackData) => {
	    if (trackData.type === 'audio' && trackData.info.requiresPcmTransformation) {
	        const { sampleSize } = parsePcmCodec(trackData.track.source._codec);
	        // With PCM, every sample has the same size
	        return fullBox('stsz', 0, 0, [
	            u32(sampleSize * trackData.info.numberOfChannels), // Sample size
	            u32(trackData.samples.reduce((acc, x) => acc + intoTimescale(x.duration, trackData.timescale), 0)),
	        ]);
	    }
	    return fullBox('stsz', 0, 0, [
	        u32(0), // Sample size (0 means non-constant size)
	        u32(trackData.samples.length), // Number of entries
	        trackData.samples.map(x => u32(x.size)), // Sample size table
	    ]);
	};
	/** Chunk Offset Box: Identifies the location of each chunk of data in the media's data stream, relative to the file. */
	const stco = (trackData) => {
	    if (trackData.finalizedChunks.length > 0 && last(trackData.finalizedChunks).offset >= 2 ** 32) {
	        // If the file is large, use the co64 box
	        return fullBox('co64', 0, 0, [
	            u32(trackData.finalizedChunks.length), // Number of entries
	            trackData.finalizedChunks.map(x => u64(x.offset)), // Chunk offset table
	        ]);
	    }
	    return fullBox('stco', 0, 0, [
	        u32(trackData.finalizedChunks.length), // Number of entries
	        trackData.finalizedChunks.map(x => u32(x.offset)), // Chunk offset table
	    ]);
	};
	/**
	 * Composition Time to Sample Box: Stores composition time offset information (PTS-DTS) for a
	 * media's samples. The table is compact, meaning that consecutive samples with the same time
	 * composition time offset will be grouped.
	 */
	const ctts = (trackData) => {
	    return fullBox('ctts', 1, 0, [
	        u32(trackData.compositionTimeOffsetTable.length), // Number of entries
	        trackData.compositionTimeOffsetTable.map(x => [
	            u32(x.sampleCount), // Sample count
	            i32(x.sampleCompositionTimeOffset), // Sample offset
	        ]),
	    ]);
	};
	/**
	 * Composition to Decode Box: Stores information about the composition and display times of the media samples.
	 */
	const cslg = (trackData) => {
	    let leastDecodeToDisplayDelta = Infinity;
	    let greatestDecodeToDisplayDelta = -Infinity;
	    let compositionStartTime = Infinity;
	    let compositionEndTime = -Infinity;
	    assert(trackData.compositionTimeOffsetTable.length > 0);
	    assert(trackData.samples.length > 0);
	    for (let i = 0; i < trackData.compositionTimeOffsetTable.length; i++) {
	        const entry = trackData.compositionTimeOffsetTable[i];
	        leastDecodeToDisplayDelta = Math.min(leastDecodeToDisplayDelta, entry.sampleCompositionTimeOffset);
	        greatestDecodeToDisplayDelta = Math.max(greatestDecodeToDisplayDelta, entry.sampleCompositionTimeOffset);
	    }
	    for (let i = 0; i < trackData.samples.length; i++) {
	        const sample = trackData.samples[i];
	        compositionStartTime = Math.min(compositionStartTime, intoTimescale(sample.timestamp, trackData.timescale));
	        compositionEndTime = Math.max(compositionEndTime, intoTimescale(sample.timestamp + sample.duration, trackData.timescale));
	    }
	    const compositionToDtsShift = Math.max(-leastDecodeToDisplayDelta, 0);
	    if (compositionEndTime >= 2 ** 31) {
	        // For very large files, the composition end time can't be represented in i32, so let's just scrap the box in
	        // that case. QuickTime fails to read the file if there's a cslg box with version 1, so that's sadly not an
	        // option.
	        return null;
	    }
	    return fullBox('cslg', 0, 0, [
	        i32(compositionToDtsShift), // Composition to DTS shift
	        i32(leastDecodeToDisplayDelta), // Least decode to display delta
	        i32(greatestDecodeToDisplayDelta), // Greatest decode to display delta
	        i32(compositionStartTime), // Composition start time
	        i32(compositionEndTime), // Composition end time
	    ]);
	};
	/**
	 * Movie Extends Box: This box signals to readers that the file is fragmented. Contains a single Track Extends Box
	 * for each track in the movie.
	 */
	const mvex = (trackDatas) => {
	    return box('mvex', undefined, trackDatas.map(trex));
	};
	/** Track Extends Box: Contains the default values used by the movie fragments. */
	const trex = (trackData) => {
	    return fullBox('trex', 0, 0, [
	        u32(trackData.track.id), // Track ID
	        u32(1), // Default sample description index
	        u32(0), // Default sample duration
	        u32(0), // Default sample size
	        u32(0), // Default sample flags
	    ]);
	};
	/**
	 * Movie Fragment Box: The movie fragments extend the presentation in time. They provide the information that would
	 * previously have been	in the Movie Box.
	 */
	const moof = (sequenceNumber, trackDatas) => {
	    return box('moof', undefined, [
	        mfhd(sequenceNumber),
	        ...trackDatas.map(traf),
	    ]);
	};
	/** Movie Fragment Header Box: Contains a sequence number as a safety check. */
	const mfhd = (sequenceNumber) => {
	    return fullBox('mfhd', 0, 0, [
	        u32(sequenceNumber), // Sequence number
	    ]);
	};
	const fragmentSampleFlags = (sample) => {
	    let byte1 = 0;
	    let byte2 = 0;
	    const byte3 = 0;
	    const byte4 = 0;
	    const sampleIsDifferenceSample = sample.type === 'delta';
	    byte2 |= +sampleIsDifferenceSample;
	    if (sampleIsDifferenceSample) {
	        byte1 |= 1; // There is redundant coding in this sample
	    }
	    else {
	        byte1 |= 2; // There is no redundant coding in this sample
	    }
	    // Note that there are a lot of other flags to potentially set here, but most are irrelevant / non-necessary
	    return byte1 << 24 | byte2 << 16 | byte3 << 8 | byte4;
	};
	/** Track Fragment Box */
	const traf = (trackData) => {
	    return box('traf', undefined, [
	        tfhd(trackData),
	        tfdt(trackData),
	        trun(trackData),
	    ]);
	};
	/** Track Fragment Header Box: Provides a reference to the extended track, and flags. */
	const tfhd = (trackData) => {
	    assert(trackData.currentChunk);
	    let tfFlags = 0;
	    tfFlags |= 0x00008; // Default sample duration present
	    tfFlags |= 0x00010; // Default sample size present
	    tfFlags |= 0x00020; // Default sample flags present
	    tfFlags |= 0x20000; // Default base is moof
	    // Prefer the second sample over the first one, as the first one is a sync sample and therefore the "odd one out"
	    const referenceSample = trackData.currentChunk.samples[1] ?? trackData.currentChunk.samples[0];
	    const referenceSampleInfo = {
	        duration: referenceSample.timescaleUnitsToNextSample,
	        size: referenceSample.size,
	        flags: fragmentSampleFlags(referenceSample),
	    };
	    return fullBox('tfhd', 0, tfFlags, [
	        u32(trackData.track.id), // Track ID
	        u32(referenceSampleInfo.duration), // Default sample duration
	        u32(referenceSampleInfo.size), // Default sample size
	        u32(referenceSampleInfo.flags), // Default sample flags
	    ]);
	};
	/**
	 * Track Fragment Decode Time Box: Provides the absolute decode time of the first sample of the fragment. This is
	 * useful for performing random access on the media file.
	 */
	const tfdt = (trackData) => {
	    assert(trackData.currentChunk);
	    return fullBox('tfdt', 1, 0, [
	        u64(intoTimescale(trackData.currentChunk.startTimestamp, trackData.timescale)), // Base Media Decode Time
	    ]);
	};
	/** Track Run Box: Specifies a run of contiguous samples for a given track. */
	const trun = (trackData) => {
	    assert(trackData.currentChunk);
	    const allSampleDurations = trackData.currentChunk.samples.map(x => x.timescaleUnitsToNextSample);
	    const allSampleSizes = trackData.currentChunk.samples.map(x => x.size);
	    const allSampleFlags = trackData.currentChunk.samples.map(fragmentSampleFlags);
	    const allSampleCompositionTimeOffsets = trackData.currentChunk.samples
	        .map(x => intoTimescale(x.timestamp - x.decodeTimestamp, trackData.timescale));
	    const uniqueSampleDurations = new Set(allSampleDurations);
	    const uniqueSampleSizes = new Set(allSampleSizes);
	    const uniqueSampleFlags = new Set(allSampleFlags);
	    const uniqueSampleCompositionTimeOffsets = new Set(allSampleCompositionTimeOffsets);
	    const firstSampleFlagsPresent = uniqueSampleFlags.size === 2 && allSampleFlags[0] !== allSampleFlags[1];
	    const sampleDurationPresent = uniqueSampleDurations.size > 1;
	    const sampleSizePresent = uniqueSampleSizes.size > 1;
	    const sampleFlagsPresent = !firstSampleFlagsPresent && uniqueSampleFlags.size > 1;
	    const sampleCompositionTimeOffsetsPresent = uniqueSampleCompositionTimeOffsets.size > 1 || [...uniqueSampleCompositionTimeOffsets].some(x => x !== 0);
	    let flags = 0;
	    flags |= 0x0001; // Data offset present
	    flags |= 0x0004 * +firstSampleFlagsPresent; // First sample flags present
	    flags |= 0x0100 * +sampleDurationPresent; // Sample duration present
	    flags |= 0x0200 * +sampleSizePresent; // Sample size present
	    flags |= 0x0400 * +sampleFlagsPresent; // Sample flags present
	    flags |= 0x0800 * +sampleCompositionTimeOffsetsPresent; // Sample composition time offsets present
	    return fullBox('trun', 1, flags, [
	        u32(trackData.currentChunk.samples.length), // Sample count
	        u32(trackData.currentChunk.offset - trackData.currentChunk.moofOffset || 0), // Data offset
	        firstSampleFlagsPresent ? u32(allSampleFlags[0]) : [],
	        trackData.currentChunk.samples.map((_, i) => [
	            sampleDurationPresent ? u32(allSampleDurations[i]) : [], // Sample duration
	            sampleSizePresent ? u32(allSampleSizes[i]) : [], // Sample size
	            sampleFlagsPresent ? u32(allSampleFlags[i]) : [], // Sample flags
	            // Sample composition time offsets
	            sampleCompositionTimeOffsetsPresent ? i32(allSampleCompositionTimeOffsets[i]) : [],
	        ]),
	    ]);
	};
	/**
	 * Movie Fragment Random Access Box: For each track, provides pointers to sync samples within the file
	 * for random access.
	 */
	const mfra = (trackDatas) => {
	    return box('mfra', undefined, [
	        ...trackDatas.map(tfra),
	        mfro(),
	    ]);
	};
	/** Track Fragment Random Access Box: Provides pointers to sync samples within the file for random access. */
	const tfra = (trackData, trackIndex) => {
	    const version = 1; // Using this version allows us to use 64-bit time and offset values
	    return fullBox('tfra', version, 0, [
	        u32(trackData.track.id), // Track ID
	        u32(0b111111), // This specifies that traf number, trun number and sample number are 32-bit ints
	        u32(trackData.finalizedChunks.length), // Number of entries
	        trackData.finalizedChunks.map(chunk => [
	            u64(intoTimescale(chunk.samples[0].timestamp, trackData.timescale)), // Time (in presentation time)
	            u64(chunk.moofOffset), // moof offset
	            u32(trackIndex + 1), // traf number
	            u32(1), // trun number
	            u32(1), // Sample number
	        ]),
	    ]);
	};
	/**
	 * Movie Fragment Random Access Offset Box: Provides the size of the enclosing mfra box. This box can be used by readers
	 * to quickly locate the mfra box by searching from the end of the file.
	 */
	const mfro = () => {
	    return fullBox('mfro', 0, 0, [
	        // This value needs to be overwritten manually from the outside, where the actual size of the enclosing mfra box
	        // is known
	        u32(0), // Size
	    ]);
	};
	/** VTT Empty Cue Box */
	const vtte = () => box('vtte');
	/** VTT Cue Box */
	const vttc = (payload, timestamp, identifier, settings, sourceId) => box('vttc', undefined, [
	    sourceId !== null ? box('vsid', [i32(sourceId)]) : null,
	    identifier !== null ? box('iden', [...textEncoder.encode(identifier)]) : null,
	    timestamp !== null ? box('ctim', [...textEncoder.encode(formatSubtitleTimestamp(timestamp))]) : null,
	    settings !== null ? box('sttg', [...textEncoder.encode(settings)]) : null,
	    box('payl', [...textEncoder.encode(payload)]),
	]);
	/** VTT Additional Text Box */
	const vtta = (notes) => box('vtta', [...textEncoder.encode(notes)]);
	/** User Data Box */
	const udta = (muxer) => {
	    const boxes = [];
	    const metadataFormat = muxer.format._options.metadataFormat ?? 'auto';
	    const metadataTags = muxer.output._metadataTags;
	    // Depending on the format, metadata tags are written differently
	    if (metadataFormat === 'mdir' || (metadataFormat === 'auto' && !muxer.isQuickTime)) {
	        const metaBox = metaMdir(metadataTags);
	        if (metaBox)
	            boxes.push(metaBox);
	    }
	    else if (metadataFormat === 'mdta') {
	        const metaBox = metaMdta(metadataTags);
	        if (metaBox)
	            boxes.push(metaBox);
	    }
	    else if (metadataFormat === 'udta' || (metadataFormat === 'auto' && muxer.isQuickTime)) {
	        addQuickTimeMetadataTagBoxes(boxes, muxer.output._metadataTags);
	    }
	    if (boxes.length === 0) {
	        return null;
	    }
	    return box('udta', undefined, boxes);
	};
	const addQuickTimeMetadataTagBoxes = (boxes, tags) => {
	    // https://exiftool.org/TagNames/QuickTime.html (QuickTime UserData Tags)
	    // For QuickTime files, metadata tags are dumped into the udta box
	    for (const { key, value } of keyValueIterator(tags)) {
	        switch (key) {
	            case 'title':
	                {
	                    boxes.push(metadataTagStringBoxShort('©nam', value));
	                }
	                break;
	            case 'description':
	                {
	                    boxes.push(metadataTagStringBoxShort('©des', value));
	                }
	                break;
	            case 'artist':
	                {
	                    boxes.push(metadataTagStringBoxShort('©ART', value));
	                }
	                break;
	            case 'album':
	                {
	                    boxes.push(metadataTagStringBoxShort('©alb', value));
	                }
	                break;
	            case 'albumArtist':
	                {
	                    boxes.push(metadataTagStringBoxShort('albr', value));
	                }
	                break;
	            case 'genre':
	                {
	                    boxes.push(metadataTagStringBoxShort('©gen', value));
	                }
	                break;
	            case 'date':
	                {
	                    boxes.push(metadataTagStringBoxShort('©day', value.toISOString().slice(0, 10)));
	                }
	                break;
	            case 'comment':
	                {
	                    boxes.push(metadataTagStringBoxShort('©cmt', value));
	                }
	                break;
	            case 'lyrics':
	                {
	                    boxes.push(metadataTagStringBoxShort('©lyr', value));
	                }
	                break;
	            case 'raw':
	                break;
	            case 'discNumber':
	            case 'discsTotal':
	            case 'trackNumber':
	            case 'tracksTotal':
	            case 'images':
	                break;
	            default: assertNever(key);
	        }
	    }
	    if (tags.raw) {
	        for (const key in tags.raw) {
	            const value = tags.raw[key];
	            if (value == null || key.length !== 4 || boxes.some(x => x.type === key)) {
	                continue;
	            }
	            if (typeof value === 'string') {
	                boxes.push(metadataTagStringBoxShort(key, value));
	            }
	            else if (value instanceof Uint8Array) {
	                boxes.push(box(key, Array.from(value)));
	            }
	        }
	    }
	};
	const metadataTagStringBoxShort = (name, value) => {
	    const encoded = textEncoder.encode(value);
	    return box(name, [
	        u16(encoded.length),
	        u16(getLanguageCodeInt('und')),
	        Array.from(encoded),
	    ]);
	};
	const DATA_BOX_MIME_TYPE_MAP = {
	    'image/jpeg': 13,
	    'image/png': 14,
	    'image/bmp': 27,
	};
	/**
	 * Generates key-value metadata for inclusion in the "meta" box.
	 */
	const generateMetadataPairs = (tags, isMdta) => {
	    const pairs = [];
	    // https://exiftool.org/TagNames/QuickTime.html (QuickTime ItemList Tags)
	    // This is the metadata format used for MP4 files
	    for (const { key, value } of keyValueIterator(tags)) {
	        switch (key) {
	            case 'title':
	                {
	                    pairs.push({ key: isMdta ? 'title' : '©nam', value: dataStringBoxLong(value) });
	                }
	                break;
	            case 'description':
	                {
	                    pairs.push({ key: isMdta ? 'description' : '©des', value: dataStringBoxLong(value) });
	                }
	                break;
	            case 'artist':
	                {
	                    pairs.push({ key: isMdta ? 'artist' : '©ART', value: dataStringBoxLong(value) });
	                }
	                break;
	            case 'album':
	                {
	                    pairs.push({ key: isMdta ? 'album' : '©alb', value: dataStringBoxLong(value) });
	                }
	                break;
	            case 'albumArtist':
	                {
	                    pairs.push({ key: isMdta ? 'album_artist' : 'aART', value: dataStringBoxLong(value) });
	                }
	                break;
	            case 'comment':
	                {
	                    pairs.push({ key: isMdta ? 'comment' : '©cmt', value: dataStringBoxLong(value) });
	                }
	                break;
	            case 'genre':
	                {
	                    pairs.push({ key: isMdta ? 'genre' : '©gen', value: dataStringBoxLong(value) });
	                }
	                break;
	            case 'lyrics':
	                {
	                    pairs.push({ key: isMdta ? 'lyrics' : '©lyr', value: dataStringBoxLong(value) });
	                }
	                break;
	            case 'date':
	                {
	                    pairs.push({
	                        key: isMdta ? 'date' : '©day',
	                        value: dataStringBoxLong(value.toISOString().slice(0, 10)),
	                    });
	                }
	                break;
	            case 'images':
	                {
	                    for (const image of value) {
	                        if (image.kind !== 'coverFront') {
	                            continue;
	                        }
	                        pairs.push({ key: 'covr', value: box('data', [
	                                u32(DATA_BOX_MIME_TYPE_MAP[image.mimeType] ?? 0), // Type indicator
	                                u32(0), // Locale indicator
	                                Array.from(image.data), // Kinda slow, hopefully temp
	                            ]) });
	                    }
	                }
	                break;
	            case 'trackNumber':
	                {
	                    if (isMdta) {
	                        const string = tags.tracksTotal !== undefined
	                            ? `${value}/${tags.tracksTotal}`
	                            : value.toString();
	                        pairs.push({ key: 'track', value: dataStringBoxLong(string) });
	                    }
	                    else {
	                        pairs.push({ key: 'trkn', value: box('data', [
	                                u32(0), // 8 bytes empty
	                                u32(0),
	                                u16(0), // Empty
	                                u16(value),
	                                u16(tags.tracksTotal ?? 0),
	                                u16(0), // Empty
	                            ]) });
	                    }
	                }
	                break;
	            case 'discNumber':
	                {
	                    if (!isMdta) {
	                        // Only written for mdir
	                        pairs.push({ key: 'disc', value: box('data', [
	                                u32(0), // 8 bytes empty
	                                u32(0),
	                                u16(0), // Empty
	                                u16(value),
	                                u16(tags.discsTotal ?? 0),
	                                u16(0), // Empty
	                            ]) });
	                    }
	                }
	                break;
	            case 'tracksTotal':
	            case 'discsTotal':
	                break;
	            case 'raw':
	                break;
	            default: assertNever(key);
	        }
	    }
	    if (tags.raw) {
	        for (const key in tags.raw) {
	            const value = tags.raw[key];
	            if (value == null || (!isMdta && key.length !== 4) || pairs.some(x => x.key === key)) {
	                continue;
	            }
	            if (typeof value === 'string') {
	                pairs.push({ key, value: dataStringBoxLong(value) });
	            }
	            else if (value instanceof Uint8Array) {
	                pairs.push({ key, value: box('data', [
	                        u32(0), // Type indicator
	                        u32(0), // Locale indicator
	                        Array.from(value),
	                    ]) });
	            }
	            else if (value instanceof RichImageData) {
	                pairs.push({ key, value: box('data', [
	                        u32(DATA_BOX_MIME_TYPE_MAP[value.mimeType] ?? 0), // Type indicator
	                        u32(0), // Locale indicator
	                        Array.from(value.data), // Kinda slow, hopefully temp
	                    ]) });
	            }
	        }
	    }
	    return pairs;
	};
	/** Metadata Box (mdir format) */
	const metaMdir = (tags) => {
	    const pairs = generateMetadataPairs(tags, false);
	    if (pairs.length === 0) {
	        return null;
	    }
	    // fullBox format
	    return fullBox('meta', 0, 0, undefined, [
	        hdlr(false, 'mdir', '', 'appl'), // mdir handler
	        box('ilst', undefined, pairs.map(pair => box(pair.key, undefined, [pair.value]))), // Item list without keys box
	    ]);
	};
	/** Metadata Box (mdta format with keys box) */
	const metaMdta = (tags) => {
	    const pairs = generateMetadataPairs(tags, true);
	    if (pairs.length === 0) {
	        return null;
	    }
	    // box without version and flags
	    return box('meta', undefined, [
	        hdlr(false, 'mdta', ''), // mdta handler
	        fullBox('keys', 0, 0, [
	            u32(pairs.length),
	        ], pairs.map(pair => box('mdta', [
	            ...textEncoder.encode(pair.key),
	        ]))),
	        box('ilst', undefined, pairs.map((pair, i) => {
	            const boxName = String.fromCharCode(...u32(i + 1));
	            return box(boxName, undefined, [pair.value]);
	        })),
	    ]);
	};
	const dataStringBoxLong = (value) => {
	    return box('data', [
	        u32(1), // Type indicator (UTF-8)
	        u32(0), // Locale indicator
	        ...textEncoder.encode(value),
	    ]);
	};
	const VIDEO_CODEC_TO_BOX_NAME = {
	    avc: 'avc1',
	    hevc: 'hvc1',
	    vp8: 'vp08',
	    vp9: 'vp09',
	    av1: 'av01',
	};
	const VIDEO_CODEC_TO_CONFIGURATION_BOX = {
	    avc: avcC,
	    hevc: hvcC,
	    vp8: vpcC,
	    vp9: vpcC,
	    av1: av1C,
	};
	const audioCodecToBoxName = (codec, isQuickTime) => {
	    switch (codec) {
	        case 'aac': return 'mp4a';
	        case 'mp3': return 'mp4a';
	        case 'opus': return 'Opus';
	        case 'vorbis': return 'mp4a';
	        case 'flac': return 'fLaC';
	        case 'ulaw': return 'ulaw';
	        case 'alaw': return 'alaw';
	        case 'pcm-u8': return 'raw ';
	        case 'pcm-s8': return 'sowt';
	    }
	    // Logic diverges here
	    if (isQuickTime) {
	        switch (codec) {
	            case 'pcm-s16': return 'sowt';
	            case 'pcm-s16be': return 'twos';
	            case 'pcm-s24': return 'in24';
	            case 'pcm-s24be': return 'in24';
	            case 'pcm-s32': return 'in32';
	            case 'pcm-s32be': return 'in32';
	            case 'pcm-f32': return 'fl32';
	            case 'pcm-f32be': return 'fl32';
	            case 'pcm-f64': return 'fl64';
	            case 'pcm-f64be': return 'fl64';
	        }
	    }
	    else {
	        switch (codec) {
	            case 'pcm-s16': return 'ipcm';
	            case 'pcm-s16be': return 'ipcm';
	            case 'pcm-s24': return 'ipcm';
	            case 'pcm-s24be': return 'ipcm';
	            case 'pcm-s32': return 'ipcm';
	            case 'pcm-s32be': return 'ipcm';
	            case 'pcm-f32': return 'fpcm';
	            case 'pcm-f32be': return 'fpcm';
	            case 'pcm-f64': return 'fpcm';
	            case 'pcm-f64be': return 'fpcm';
	        }
	    }
	};
	const audioCodecToConfigurationBox = (codec, isQuickTime) => {
	    switch (codec) {
	        case 'aac': return esds;
	        case 'mp3': return esds;
	        case 'opus': return dOps;
	        case 'vorbis': return esds;
	        case 'flac': return dfLa;
	    }
	    // Logic diverges here
	    if (isQuickTime) {
	        switch (codec) {
	            case 'pcm-s24': return wave;
	            case 'pcm-s24be': return wave;
	            case 'pcm-s32': return wave;
	            case 'pcm-s32be': return wave;
	            case 'pcm-f32': return wave;
	            case 'pcm-f32be': return wave;
	            case 'pcm-f64': return wave;
	            case 'pcm-f64be': return wave;
	        }
	    }
	    else {
	        switch (codec) {
	            case 'pcm-s16': return pcmC;
	            case 'pcm-s16be': return pcmC;
	            case 'pcm-s24': return pcmC;
	            case 'pcm-s24be': return pcmC;
	            case 'pcm-s32': return pcmC;
	            case 'pcm-s32be': return pcmC;
	            case 'pcm-f32': return pcmC;
	            case 'pcm-f32be': return pcmC;
	            case 'pcm-f64': return pcmC;
	            case 'pcm-f64be': return pcmC;
	        }
	    }
	    return null;
	};
	const SUBTITLE_CODEC_TO_BOX_NAME = {
	    webvtt: 'wvtt',
	};
	const SUBTITLE_CODEC_TO_CONFIGURATION_BOX = {
	    webvtt: vttC,
	};
	const getLanguageCodeInt = (code) => {
	    assert(code.length === 3);
	    let language = 0;
	    for (let i = 0; i < 3; i++) {
	        language <<= 5;
	        language += code.charCodeAt(i) - 0x60;
	    }
	    return language;
	};

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	class Writer {
	    constructor() {
	        /** Setting this to true will cause the writer to ensure data is written in a strictly monotonic, streamable way. */
	        this.ensureMonotonicity = false;
	        this.trackedWrites = null;
	        this.trackedStart = -1;
	        this.trackedEnd = -1;
	    }
	    start() { }
	    maybeTrackWrites(data) {
	        if (!this.trackedWrites) {
	            return;
	        }
	        // Handle negative relative write positions
	        let pos = this.getPos();
	        if (pos < this.trackedStart) {
	            if (pos + data.byteLength <= this.trackedStart) {
	                return;
	            }
	            data = data.subarray(this.trackedStart - pos);
	            pos = 0;
	        }
	        const neededSize = pos + data.byteLength - this.trackedStart;
	        let newLength = this.trackedWrites.byteLength;
	        while (newLength < neededSize) {
	            newLength *= 2;
	        }
	        // Check if we need to resize the buffer
	        if (newLength !== this.trackedWrites.byteLength) {
	            const copy = new Uint8Array(newLength);
	            copy.set(this.trackedWrites, 0);
	            this.trackedWrites = copy;
	        }
	        this.trackedWrites.set(data, pos - this.trackedStart);
	        this.trackedEnd = Math.max(this.trackedEnd, pos + data.byteLength);
	    }
	    startTrackingWrites() {
	        this.trackedWrites = new Uint8Array(2 ** 10);
	        this.trackedStart = this.getPos();
	        this.trackedEnd = this.trackedStart;
	    }
	    stopTrackingWrites() {
	        if (!this.trackedWrites) {
	            throw new Error('Internal error: Can\'t get tracked writes since nothing was tracked.');
	        }
	        const slice = this.trackedWrites.subarray(0, this.trackedEnd - this.trackedStart);
	        const result = {
	            data: slice,
	            start: this.trackedStart,
	            end: this.trackedEnd,
	        };
	        this.trackedWrites = null;
	        return result;
	    }
	}
	const ARRAY_BUFFER_INITIAL_SIZE = 2 ** 16;
	const ARRAY_BUFFER_MAX_SIZE = 2 ** 32;
	class BufferTargetWriter extends Writer {
	    constructor(target) {
	        super();
	        this.pos = 0;
	        this.maxPos = 0;
	        this.target = target;
	        this.supportsResize = 'resize' in new ArrayBuffer(0);
	        if (this.supportsResize) {
	            try {
	                // @ts-expect-error Don't want to bump "lib" in tsconfig
	                this.buffer = new ArrayBuffer(ARRAY_BUFFER_INITIAL_SIZE, { maxByteLength: ARRAY_BUFFER_MAX_SIZE });
	            }
	            catch {
	                this.buffer = new ArrayBuffer(ARRAY_BUFFER_INITIAL_SIZE);
	                this.supportsResize = false;
	            }
	        }
	        else {
	            this.buffer = new ArrayBuffer(ARRAY_BUFFER_INITIAL_SIZE);
	        }
	        this.bytes = new Uint8Array(this.buffer);
	    }
	    ensureSize(size) {
	        let newLength = this.buffer.byteLength;
	        while (newLength < size)
	            newLength *= 2;
	        if (newLength === this.buffer.byteLength)
	            return;
	        if (newLength > ARRAY_BUFFER_MAX_SIZE) {
	            throw new Error(`ArrayBuffer exceeded maximum size of ${ARRAY_BUFFER_MAX_SIZE} bytes. Please consider using another`
	                + ` target.`);
	        }
	        if (this.supportsResize) {
	            // Use resize if it exists
	            // @ts-expect-error Don't want to bump "lib" in tsconfig
	            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
	            this.buffer.resize(newLength);
	            // The Uint8Array scales automatically
	        }
	        else {
	            const newBuffer = new ArrayBuffer(newLength);
	            const newBytes = new Uint8Array(newBuffer);
	            newBytes.set(this.bytes, 0);
	            this.buffer = newBuffer;
	            this.bytes = newBytes;
	        }
	    }
	    write(data) {
	        this.maybeTrackWrites(data);
	        this.ensureSize(this.pos + data.byteLength);
	        this.bytes.set(data, this.pos);
	        this.target.onwrite?.(this.pos, this.pos + data.byteLength);
	        this.pos += data.byteLength;
	        this.maxPos = Math.max(this.maxPos, this.pos);
	    }
	    seek(newPos) {
	        this.pos = newPos;
	    }
	    getPos() {
	        return this.pos;
	    }
	    async flush() { }
	    async finalize() {
	        this.ensureSize(this.pos);
	        this.target.buffer = this.buffer.slice(0, Math.max(this.maxPos, this.pos));
	    }
	    async close() { }
	    getSlice(start, end) {
	        return this.bytes.slice(start, end);
	    }
	}
	const DEFAULT_CHUNK_SIZE = 2 ** 24;
	const MAX_CHUNKS_AT_ONCE = 2;
	/**
	 * Writes to a StreamTarget every time it is flushed, sending out all of the new data written since the
	 * last flush. This is useful for streaming applications, like piping the output to disk. When using the chunked mode,
	 * data will first be accumulated in larger chunks, and then the entire chunk will be flushed out at once when ready.
	 */
	class StreamTargetWriter extends Writer {
	    constructor(target) {
	        super();
	        this.pos = 0;
	        this.sections = [];
	        this.lastWriteEnd = 0;
	        this.lastFlushEnd = 0;
	        this.writer = null;
	        /**
	         * The data is divided up into fixed-size chunks, whose contents are first filled in RAM and then flushed out.
	         * A chunk is flushed if all of its contents have been written.
	         */
	        this.chunks = [];
	        this.target = target;
	        this.chunked = target._options.chunked ?? false;
	        this.chunkSize = target._options.chunkSize ?? DEFAULT_CHUNK_SIZE;
	    }
	    start() {
	        this.writer = this.target._writable.getWriter();
	    }
	    write(data) {
	        if (this.pos > this.lastWriteEnd) {
	            const paddingBytesNeeded = this.pos - this.lastWriteEnd;
	            this.pos = this.lastWriteEnd;
	            this.write(new Uint8Array(paddingBytesNeeded));
	        }
	        this.maybeTrackWrites(data);
	        this.sections.push({
	            data: data.slice(),
	            start: this.pos,
	        });
	        this.target.onwrite?.(this.pos, this.pos + data.byteLength);
	        this.pos += data.byteLength;
	        this.lastWriteEnd = Math.max(this.lastWriteEnd, this.pos);
	    }
	    seek(newPos) {
	        this.pos = newPos;
	    }
	    getPos() {
	        return this.pos;
	    }
	    async flush() {
	        if (this.pos > this.lastWriteEnd) {
	            // There's a "void" between the last written byte and the next byte we're about to write. Let's pad that
	            // void with zeroes explicitly.
	            const paddingBytesNeeded = this.pos - this.lastWriteEnd;
	            this.pos = this.lastWriteEnd;
	            this.write(new Uint8Array(paddingBytesNeeded));
	        }
	        assert(this.writer);
	        if (this.sections.length === 0)
	            return;
	        const chunks = [];
	        const sorted = [...this.sections].sort((a, b) => a.start - b.start);
	        chunks.push({
	            start: sorted[0].start,
	            size: sorted[0].data.byteLength,
	        });
	        // Figure out how many contiguous chunks we have
	        for (let i = 1; i < sorted.length; i++) {
	            const lastChunk = chunks[chunks.length - 1];
	            const section = sorted[i];
	            if (section.start <= lastChunk.start + lastChunk.size) {
	                lastChunk.size = Math.max(lastChunk.size, section.start + section.data.byteLength - lastChunk.start);
	            }
	            else {
	                chunks.push({
	                    start: section.start,
	                    size: section.data.byteLength,
	                });
	            }
	        }
	        for (const chunk of chunks) {
	            chunk.data = new Uint8Array(chunk.size);
	            // Make sure to write the data in the correct order for correct overwriting
	            for (const section of this.sections) {
	                // Check if the section is in the chunk
	                if (chunk.start <= section.start && section.start < chunk.start + chunk.size) {
	                    chunk.data.set(section.data, section.start - chunk.start);
	                }
	            }
	            if (this.writer.desiredSize !== null && this.writer.desiredSize <= 0) {
	                await this.writer.ready; // Allow the writer to apply backpressure
	            }
	            if (this.chunked) {
	                // Let's first gather the data into bigger chunks before writing it
	                this.writeDataIntoChunks(chunk.data, chunk.start);
	                this.tryToFlushChunks();
	            }
	            else {
	                if (this.ensureMonotonicity && chunk.start !== this.lastFlushEnd) {
	                    throw new Error('Internal error: Monotonicity violation.');
	                }
	                // Write out the data immediately
	                void this.writer.write({
	                    type: 'write',
	                    data: chunk.data,
	                    position: chunk.start,
	                });
	                this.lastFlushEnd = chunk.start + chunk.data.byteLength;
	            }
	        }
	        this.sections.length = 0;
	    }
	    writeDataIntoChunks(data, position) {
	        // First, find the chunk to write the data into, or create one if none exists
	        let chunkIndex = this.chunks.findIndex(x => x.start <= position && position < x.start + this.chunkSize);
	        if (chunkIndex === -1)
	            chunkIndex = this.createChunk(position);
	        const chunk = this.chunks[chunkIndex];
	        // Figure out how much to write to the chunk, and then write to the chunk
	        const relativePosition = position - chunk.start;
	        const toWrite = data.subarray(0, Math.min(this.chunkSize - relativePosition, data.byteLength));
	        chunk.data.set(toWrite, relativePosition);
	        // Create a section describing the region of data that was just written to
	        const section = {
	            start: relativePosition,
	            end: relativePosition + toWrite.byteLength,
	        };
	        this.insertSectionIntoChunk(chunk, section);
	        // Queue chunk for flushing to target if it has been fully written to
	        if (chunk.written[0].start === 0 && chunk.written[0].end === this.chunkSize) {
	            chunk.shouldFlush = true;
	        }
	        // Make sure we don't hold too many chunks in memory at once to keep memory usage down
	        if (this.chunks.length > MAX_CHUNKS_AT_ONCE) {
	            // Flush all but the last chunk
	            for (let i = 0; i < this.chunks.length - 1; i++) {
	                this.chunks[i].shouldFlush = true;
	            }
	            this.tryToFlushChunks();
	        }
	        // If the data didn't fit in one chunk, recurse with the remaining data
	        if (toWrite.byteLength < data.byteLength) {
	            this.writeDataIntoChunks(data.subarray(toWrite.byteLength), position + toWrite.byteLength);
	        }
	    }
	    insertSectionIntoChunk(chunk, section) {
	        let low = 0;
	        let high = chunk.written.length - 1;
	        let index = -1;
	        // Do a binary search to find the last section with a start not larger than `section`'s start
	        while (low <= high) {
	            const mid = Math.floor(low + (high - low + 1) / 2);
	            if (chunk.written[mid].start <= section.start) {
	                low = mid + 1;
	                index = mid;
	            }
	            else {
	                high = mid - 1;
	            }
	        }
	        // Insert the new section
	        chunk.written.splice(index + 1, 0, section);
	        if (index === -1 || chunk.written[index].end < section.start)
	            index++;
	        // Merge overlapping sections
	        while (index < chunk.written.length - 1 && chunk.written[index].end >= chunk.written[index + 1].start) {
	            chunk.written[index].end = Math.max(chunk.written[index].end, chunk.written[index + 1].end);
	            chunk.written.splice(index + 1, 1);
	        }
	    }
	    createChunk(includesPosition) {
	        const start = Math.floor(includesPosition / this.chunkSize) * this.chunkSize;
	        const chunk = {
	            start,
	            data: new Uint8Array(this.chunkSize),
	            written: [],
	            shouldFlush: false,
	        };
	        this.chunks.push(chunk);
	        this.chunks.sort((a, b) => a.start - b.start);
	        return this.chunks.indexOf(chunk);
	    }
	    tryToFlushChunks(force = false) {
	        assert(this.writer);
	        for (let i = 0; i < this.chunks.length; i++) {
	            const chunk = this.chunks[i];
	            if (!chunk.shouldFlush && !force)
	                continue;
	            for (const section of chunk.written) {
	                const position = chunk.start + section.start;
	                if (this.ensureMonotonicity && position !== this.lastFlushEnd) {
	                    throw new Error('Internal error: Monotonicity violation.');
	                }
	                void this.writer.write({
	                    type: 'write',
	                    data: chunk.data.subarray(section.start, section.end),
	                    position,
	                });
	                this.lastFlushEnd = chunk.start + section.end;
	            }
	            this.chunks.splice(i--, 1);
	        }
	    }
	    finalize() {
	        if (this.chunked) {
	            this.tryToFlushChunks(true);
	        }
	        assert(this.writer);
	        return this.writer.close();
	    }
	    async close() {
	        return this.writer?.close();
	    }
	}

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	/**
	 * Base class for targets, specifying where output files are written.
	 * @group Output targets
	 * @public
	 */
	class Target {
	    constructor() {
	        /** @internal */
	        this._output = null;
	        /**
	         * Called each time data is written to the target. Will be called with the byte range into which data was written.
	         *
	         * Use this callback to track the size of the output file as it grows. But be warned, this function is chatty and
	         * gets called *extremely* often.
	         */
	        this.onwrite = null;
	    }
	}
	/**
	 * A target that writes data directly into an ArrayBuffer in memory. Great for performance, but not suitable for very
	 * large files. The buffer will be available once the output has been finalized.
	 * @group Output targets
	 * @public
	 */
	class BufferTarget extends Target {
	    constructor() {
	        super(...arguments);
	        /** Stores the final output buffer. Until the output is finalized, this will be `null`. */
	        this.buffer = null;
	    }
	    /** @internal */
	    _createWriter() {
	        return new BufferTargetWriter(this);
	    }
	}
	/**
	 * This target writes data to a [`WritableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream),
	 * making it a general-purpose target for writing data anywhere. It is also compatible with
	 * [`FileSystemWritableFileStream`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream) for
	 * use with the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API). The
	 * `WritableStream` can also apply backpressure, which will propagate to the output and throttle the encoders.
	 * @group Output targets
	 * @public
	 */
	class StreamTarget extends Target {
	    /** Creates a new {@link StreamTarget} which writes to the specified `writable`. */
	    constructor(writable, options = {}) {
	        super();
	        if (!(writable instanceof WritableStream)) {
	            throw new TypeError('StreamTarget requires a WritableStream instance.');
	        }
	        if (options != null && typeof options !== 'object') {
	            throw new TypeError('StreamTarget options, when provided, must be an object.');
	        }
	        if (options.chunked !== undefined && typeof options.chunked !== 'boolean') {
	            throw new TypeError('options.chunked, when provided, must be a boolean.');
	        }
	        if (options.chunkSize !== undefined && (!Number.isInteger(options.chunkSize) || options.chunkSize < 1024)) {
	            throw new TypeError('options.chunkSize, when provided, must be an integer and not smaller than 1024.');
	        }
	        this._writable = writable;
	        this._options = options;
	    }
	    /** @internal */
	    _createWriter() {
	        return new StreamTargetWriter(this);
	    }
	}

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	const GLOBAL_TIMESCALE = 1000;
	const TIMESTAMP_OFFSET = 2_082_844_800; // Seconds between Jan 1 1904 and Jan 1 1970
	const getTrackMetadata = (trackData) => {
	    const metadata = {};
	    const track = trackData.track;
	    if (track.metadata.name !== undefined) {
	        metadata.name = track.metadata.name;
	    }
	    return metadata;
	};
	const intoTimescale = (timeInSeconds, timescale, round = true) => {
	    const value = timeInSeconds * timescale;
	    return round ? Math.round(value) : value;
	};
	class IsobmffMuxer extends Muxer {
	    constructor(output, format) {
	        super(output);
	        this.auxTarget = new BufferTarget();
	        this.auxWriter = this.auxTarget._createWriter();
	        this.auxBoxWriter = new IsobmffBoxWriter(this.auxWriter);
	        this.mdat = null;
	        this.ftypSize = null;
	        this.trackDatas = [];
	        this.allTracksKnown = promiseWithResolvers();
	        this.creationTime = Math.floor(Date.now() / 1000) + TIMESTAMP_OFFSET;
	        this.finalizedChunks = [];
	        this.nextFragmentNumber = 1;
	        // Only relevant for fragmented files, to make sure new fragments start with the highest timestamp seen so far
	        this.maxWrittenTimestamp = -Infinity;
	        this.format = format;
	        this.writer = output._writer;
	        this.boxWriter = new IsobmffBoxWriter(this.writer);
	        this.isQuickTime = format instanceof MovOutputFormat;
	        // If the fastStart option isn't defined, enable in-memory fast start if the target is an ArrayBuffer, as the
	        // memory usage remains identical
	        const fastStartDefault = this.writer instanceof BufferTargetWriter ? 'in-memory' : false;
	        this.fastStart = format._options.fastStart ?? fastStartDefault;
	        this.isFragmented = this.fastStart === 'fragmented';
	        if (this.fastStart === 'in-memory' || this.isFragmented) {
	            this.writer.ensureMonotonicity = true;
	        }
	        this.minimumFragmentDuration = format._options.minimumFragmentDuration ?? 1;
	    }
	    async start() {
	        const release = await this.mutex.acquire();
	        const holdsAvc = this.output._tracks.some(x => x.type === 'video' && x.source._codec === 'avc');
	        // Write the header
	        {
	            if (this.format._options.onFtyp) {
	                this.writer.startTrackingWrites();
	            }
	            this.boxWriter.writeBox(ftyp({
	                isQuickTime: this.isQuickTime,
	                holdsAvc: holdsAvc,
	                fragmented: this.isFragmented,
	            }));
	            if (this.format._options.onFtyp) {
	                const { data, start } = this.writer.stopTrackingWrites();
	                this.format._options.onFtyp(data, start);
	            }
	        }
	        this.ftypSize = this.writer.getPos();
	        if (this.fastStart === 'in-memory') ;
	        else if (this.fastStart === 'reserve') {
	            // Validate that all tracks have set maximumPacketCount
	            for (const track of this.output._tracks) {
	                if (track.metadata.maximumPacketCount === undefined) {
	                    throw new Error('All tracks must specify maximumPacketCount in their metadata when using'
	                        + ' fastStart: \'reserve\'.');
	                }
	            }
	            // We'll start writing once we know all tracks
	        }
	        else if (this.isFragmented) ;
	        else {
	            if (this.format._options.onMdat) {
	                this.writer.startTrackingWrites();
	            }
	            this.mdat = mdat(true); // Reserve large size by default, can refine this when finalizing.
	            this.boxWriter.writeBox(this.mdat);
	        }
	        await this.writer.flush();
	        release();
	    }
	    allTracksAreKnown() {
	        for (const track of this.output._tracks) {
	            if (!track.source._closed && !this.trackDatas.some(x => x.track === track)) {
	                return false; // We haven't seen a sample from this open track yet
	            }
	        }
	        return true;
	    }
	    async getMimeType() {
	        await this.allTracksKnown.promise;
	        const codecStrings = this.trackDatas.map((trackData) => {
	            if (trackData.type === 'video') {
	                return trackData.info.decoderConfig.codec;
	            }
	            else if (trackData.type === 'audio') {
	                return trackData.info.decoderConfig.codec;
	            }
	            else {
	                const map = {
	                    webvtt: 'wvtt',
	                };
	                return map[trackData.track.source._codec];
	            }
	        });
	        return buildIsobmffMimeType({
	            isQuickTime: this.isQuickTime,
	            hasVideo: this.trackDatas.some(x => x.type === 'video'),
	            hasAudio: this.trackDatas.some(x => x.type === 'audio'),
	            codecStrings,
	        });
	    }
	    getVideoTrackData(track, packet, meta) {
	        const existingTrackData = this.trackDatas.find(x => x.track === track);
	        if (existingTrackData) {
	            return existingTrackData;
	        }
	        validateVideoChunkMetadata(meta);
	        assert(meta);
	        assert(meta.decoderConfig);
	        const decoderConfig = { ...meta.decoderConfig };
	        assert(decoderConfig.codedWidth !== undefined);
	        assert(decoderConfig.codedHeight !== undefined);
	        let requiresAnnexBTransformation = false;
	        if (track.source._codec === 'avc' && !decoderConfig.description) {
	            // ISOBMFF can only hold AVC in the AVCC format, not in Annex B, but the missing description indicates
	            // Annex B. This means we'll need to do some converterino.
	            const decoderConfigurationRecord = extractAvcDecoderConfigurationRecord(packet.data);
	            if (!decoderConfigurationRecord) {
	                throw new Error('Couldn\'t extract an AVCDecoderConfigurationRecord from the AVC packet. Make sure the packets are'
	                    + ' in Annex B format (as specified in ITU-T-REC-H.264) when not providing a description, or'
	                    + ' provide a description (must be an AVCDecoderConfigurationRecord as specified in ISO 14496-15)'
	                    + ' and ensure the packets are in AVCC format.');
	            }
	            decoderConfig.description = serializeAvcDecoderConfigurationRecord(decoderConfigurationRecord);
	            requiresAnnexBTransformation = true;
	        }
	        else if (track.source._codec === 'hevc' && !decoderConfig.description) {
	            // ISOBMFF can only hold HEVC in the HEVC format, not in Annex B, but the missing description indicates
	            // Annex B. This means we'll need to do some converterino.
	            const decoderConfigurationRecord = extractHevcDecoderConfigurationRecord(packet.data);
	            if (!decoderConfigurationRecord) {
	                throw new Error('Couldn\'t extract an HEVCDecoderConfigurationRecord from the HEVC packet. Make sure the packets'
	                    + ' are in Annex B format (as specified in ITU-T-REC-H.265) when not providing a description, or'
	                    + ' provide a description (must be an HEVCDecoderConfigurationRecord as specified in ISO 14496-15)'
	                    + ' and ensure the packets are in HEVC format.');
	            }
	            decoderConfig.description = serializeHevcDecoderConfigurationRecord(decoderConfigurationRecord);
	            requiresAnnexBTransformation = true;
	        }
	        // The frame rate set by the user may not be an integer. Since timescale is an integer, we'll approximate the
	        // frame time (inverse of frame rate) with a rational number, then use that approximation's denominator
	        // as the timescale.
	        const timescale = computeRationalApproximation(1 / (track.metadata.frameRate ?? 57600), 1e6).denominator;
	        const newTrackData = {
	            muxer: this,
	            track,
	            type: 'video',
	            info: {
	                width: decoderConfig.codedWidth,
	                height: decoderConfig.codedHeight,
	                decoderConfig: decoderConfig,
	                requiresAnnexBTransformation,
	            },
	            timescale,
	            samples: [],
	            sampleQueue: [],
	            timestampProcessingQueue: [],
	            timeToSampleTable: [],
	            compositionTimeOffsetTable: [],
	            lastTimescaleUnits: null,
	            lastSample: null,
	            finalizedChunks: [],
	            currentChunk: null,
	            compactlyCodedChunkTable: [],
	        };
	        this.trackDatas.push(newTrackData);
	        this.trackDatas.sort((a, b) => a.track.id - b.track.id);
	        if (this.allTracksAreKnown()) {
	            this.allTracksKnown.resolve();
	        }
	        return newTrackData;
	    }
	    getAudioTrackData(track, meta) {
	        const existingTrackData = this.trackDatas.find(x => x.track === track);
	        if (existingTrackData) {
	            return existingTrackData;
	        }
	        validateAudioChunkMetadata(meta);
	        assert(meta);
	        assert(meta.decoderConfig);
	        const newTrackData = {
	            muxer: this,
	            track,
	            type: 'audio',
	            info: {
	                numberOfChannels: meta.decoderConfig.numberOfChannels,
	                sampleRate: meta.decoderConfig.sampleRate,
	                decoderConfig: meta.decoderConfig,
	                requiresPcmTransformation: !this.isFragmented
	                    && PCM_AUDIO_CODECS.includes(track.source._codec),
	            },
	            timescale: meta.decoderConfig.sampleRate,
	            samples: [],
	            sampleQueue: [],
	            timestampProcessingQueue: [],
	            timeToSampleTable: [],
	            compositionTimeOffsetTable: [],
	            lastTimescaleUnits: null,
	            lastSample: null,
	            finalizedChunks: [],
	            currentChunk: null,
	            compactlyCodedChunkTable: [],
	        };
	        this.trackDatas.push(newTrackData);
	        this.trackDatas.sort((a, b) => a.track.id - b.track.id);
	        if (this.allTracksAreKnown()) {
	            this.allTracksKnown.resolve();
	        }
	        return newTrackData;
	    }
	    getSubtitleTrackData(track, meta) {
	        const existingTrackData = this.trackDatas.find(x => x.track === track);
	        if (existingTrackData) {
	            return existingTrackData;
	        }
	        validateSubtitleMetadata(meta);
	        assert(meta);
	        assert(meta.config);
	        const newTrackData = {
	            muxer: this,
	            track,
	            type: 'subtitle',
	            info: {
	                config: meta.config,
	            },
	            timescale: 1000, // Reasonable
	            samples: [],
	            sampleQueue: [],
	            timestampProcessingQueue: [],
	            timeToSampleTable: [],
	            compositionTimeOffsetTable: [],
	            lastTimescaleUnits: null,
	            lastSample: null,
	            finalizedChunks: [],
	            currentChunk: null,
	            compactlyCodedChunkTable: [],
	            lastCueEndTimestamp: 0,
	            cueQueue: [],
	            nextSourceId: 0,
	            cueToSourceId: new WeakMap(),
	        };
	        this.trackDatas.push(newTrackData);
	        this.trackDatas.sort((a, b) => a.track.id - b.track.id);
	        if (this.allTracksAreKnown()) {
	            this.allTracksKnown.resolve();
	        }
	        return newTrackData;
	    }
	    async addEncodedVideoPacket(track, packet, meta) {
	        const release = await this.mutex.acquire();
	        try {
	            const trackData = this.getVideoTrackData(track, packet, meta);
	            let packetData = packet.data;
	            if (trackData.info.requiresAnnexBTransformation) {
	                const transformedData = transformAnnexBToLengthPrefixed(packetData);
	                if (!transformedData) {
	                    throw new Error('Failed to transform packet data. Make sure all packets are provided in Annex B format, as'
	                        + ' specified in ITU-T-REC-H.264 and ITU-T-REC-H.265.');
	                }
	                packetData = transformedData;
	            }
	            const timestamp = this.validateAndNormalizeTimestamp(trackData.track, packet.timestamp, packet.type === 'key');
	            const internalSample = this.createSampleForTrack(trackData, packetData, timestamp, packet.duration, packet.type);
	            await this.registerSample(trackData, internalSample);
	        }
	        finally {
	            release();
	        }
	    }
	    async addEncodedAudioPacket(track, packet, meta) {
	        const release = await this.mutex.acquire();
	        try {
	            const trackData = this.getAudioTrackData(track, meta);
	            const timestamp = this.validateAndNormalizeTimestamp(trackData.track, packet.timestamp, packet.type === 'key');
	            const internalSample = this.createSampleForTrack(trackData, packet.data, timestamp, packet.duration, packet.type);
	            if (trackData.info.requiresPcmTransformation) {
	                await this.maybePadWithSilence(trackData, timestamp);
	            }
	            await this.registerSample(trackData, internalSample);
	        }
	        finally {
	            release();
	        }
	    }
	    async maybePadWithSilence(trackData, untilTimestamp) {
	        // The PCM transformation assumes that all samples are contiguous. This is not something that is enforced, so
	        // we need to pad the "holes" in between samples (and before the first sample) with additional
	        // "silence samples".
	        const lastSample = last(trackData.samples);
	        const lastEndTimestamp = lastSample
	            ? lastSample.timestamp + lastSample.duration
	            : 0;
	        const delta = untilTimestamp - lastEndTimestamp;
	        const deltaInTimescale = intoTimescale(delta, trackData.timescale);
	        if (deltaInTimescale > 0) {
	            const { sampleSize, silentValue } = parsePcmCodec(trackData.info.decoderConfig.codec);
	            const samplesNeeded = deltaInTimescale * trackData.info.numberOfChannels;
	            const data = new Uint8Array(sampleSize * samplesNeeded).fill(silentValue);
	            const paddingSample = this.createSampleForTrack(trackData, new Uint8Array(data.buffer), lastEndTimestamp, delta, 'key');
	            await this.registerSample(trackData, paddingSample);
	        }
	    }
	    async addSubtitleCue(track, cue, meta) {
	        const release = await this.mutex.acquire();
	        try {
	            const trackData = this.getSubtitleTrackData(track, meta);
	            this.validateAndNormalizeTimestamp(trackData.track, cue.timestamp, true);
	            if (track.source._codec === 'webvtt') {
	                trackData.cueQueue.push(cue);
	                await this.processWebVTTCues(trackData, cue.timestamp);
	            }
	            else {
	                // TODO
	            }
	        }
	        finally {
	            release();
	        }
	    }
	    async processWebVTTCues(trackData, until) {
	        // WebVTT cues need to undergo special processing as empty sections need to be padded out with samples, and
	        // overlapping samples require special logic. The algorithm produces the format specified in ISO 14496-30.
	        while (trackData.cueQueue.length > 0) {
	            const timestamps = new Set([]);
	            for (const cue of trackData.cueQueue) {
	                assert(cue.timestamp <= until);
	                assert(trackData.lastCueEndTimestamp <= cue.timestamp + cue.duration);
	                timestamps.add(Math.max(cue.timestamp, trackData.lastCueEndTimestamp)); // Start timestamp
	                timestamps.add(cue.timestamp + cue.duration); // End timestamp
	            }
	            const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
	            // These are the timestamps of the next sample we'll create:
	            const sampleStart = sortedTimestamps[0];
	            const sampleEnd = sortedTimestamps[1] ?? sampleStart;
	            if (until < sampleEnd) {
	                break;
	            }
	            // We may need to pad out empty space with an vtte box
	            if (trackData.lastCueEndTimestamp < sampleStart) {
	                this.auxWriter.seek(0);
	                const box = vtte();
	                this.auxBoxWriter.writeBox(box);
	                const body = this.auxWriter.getSlice(0, this.auxWriter.getPos());
	                const sample = this.createSampleForTrack(trackData, body, trackData.lastCueEndTimestamp, sampleStart - trackData.lastCueEndTimestamp, 'key');
	                await this.registerSample(trackData, sample);
	                trackData.lastCueEndTimestamp = sampleStart;
	            }
	            this.auxWriter.seek(0);
	            for (let i = 0; i < trackData.cueQueue.length; i++) {
	                const cue = trackData.cueQueue[i];
	                if (cue.timestamp >= sampleEnd) {
	                    break;
	                }
	                inlineTimestampRegex.lastIndex = 0;
	                const containsTimestamp = inlineTimestampRegex.test(cue.text);
	                const endTimestamp = cue.timestamp + cue.duration;
	                let sourceId = trackData.cueToSourceId.get(cue);
	                if (sourceId === undefined && sampleEnd < endTimestamp) {
	                    // We know this cue will appear in more than one sample, therefore we need to mark it with a
	                    // unique ID
	                    sourceId = trackData.nextSourceId++;
	                    trackData.cueToSourceId.set(cue, sourceId);
	                }
	                if (cue.notes) {
	                    // Any notes/comments are included in a special vtta box
	                    const box = vtta(cue.notes);
	                    this.auxBoxWriter.writeBox(box);
	                }
	                const box = vttc(cue.text, containsTimestamp ? sampleStart : null, cue.identifier ?? null, cue.settings ?? null, sourceId ?? null);
	                this.auxBoxWriter.writeBox(box);
	                if (endTimestamp === sampleEnd) {
	                    // The cue won't appear in any future sample, so we're done with it
	                    trackData.cueQueue.splice(i--, 1);
	                }
	            }
	            const body = this.auxWriter.getSlice(0, this.auxWriter.getPos());
	            const sample = this.createSampleForTrack(trackData, body, sampleStart, sampleEnd - sampleStart, 'key');
	            await this.registerSample(trackData, sample);
	            trackData.lastCueEndTimestamp = sampleEnd;
	        }
	    }
	    createSampleForTrack(trackData, data, timestamp, duration, type) {
	        const sample = {
	            timestamp,
	            decodeTimestamp: timestamp, // This may be refined later
	            duration,
	            data,
	            size: data.byteLength,
	            type,
	            timescaleUnitsToNextSample: intoTimescale(duration, trackData.timescale), // Will be refined
	        };
	        return sample;
	    }
	    processTimestamps(trackData, nextSample) {
	        if (trackData.timestampProcessingQueue.length === 0) {
	            return;
	        }
	        if (trackData.type === 'audio' && trackData.info.requiresPcmTransformation) {
	            let totalDuration = 0;
	            // Compute the total duration in the track timescale (which is equal to the amount of PCM audio samples)
	            // and simply say that's how many new samples there are.
	            for (let i = 0; i < trackData.timestampProcessingQueue.length; i++) {
	                const sample = trackData.timestampProcessingQueue[i];
	                const duration = intoTimescale(sample.duration, trackData.timescale);
	                totalDuration += duration;
	            }
	            if (trackData.timeToSampleTable.length === 0) {
	                trackData.timeToSampleTable.push({
	                    sampleCount: totalDuration,
	                    sampleDelta: 1,
	                });
	            }
	            else {
	                const lastEntry = last(trackData.timeToSampleTable);
	                lastEntry.sampleCount += totalDuration;
	            }
	            trackData.timestampProcessingQueue.length = 0;
	            return;
	        }
	        const sortedTimestamps = trackData.timestampProcessingQueue.map(x => x.timestamp).sort((a, b) => a - b);
	        for (let i = 0; i < trackData.timestampProcessingQueue.length; i++) {
	            const sample = trackData.timestampProcessingQueue[i];
	            // Since the user only supplies presentation time, but these may be out of order, we reverse-engineer from
	            // that a sensible decode timestamp. The notion of a decode timestamp doesn't really make sense
	            // (presentation timestamp & decode order are all you need), but it is a concept in ISOBMFF so we need to
	            // model it.
	            sample.decodeTimestamp = sortedTimestamps[i];
	            if (!this.isFragmented && trackData.lastTimescaleUnits === null) {
	                // In non-fragmented files, the first decode timestamp is always zero. If the first presentation
	                // timestamp isn't zero, we'll simply use the composition time offset to achieve it.
	                sample.decodeTimestamp = 0;
	            }
	            const sampleCompositionTimeOffset = intoTimescale(sample.timestamp - sample.decodeTimestamp, trackData.timescale);
	            const durationInTimescale = intoTimescale(sample.duration, trackData.timescale);
	            if (trackData.lastTimescaleUnits !== null) {
	                assert(trackData.lastSample);
	                const timescaleUnits = intoTimescale(sample.decodeTimestamp, trackData.timescale, false);
	                const delta = Math.round(timescaleUnits - trackData.lastTimescaleUnits);
	                assert(delta >= 0);
	                trackData.lastTimescaleUnits += delta;
	                trackData.lastSample.timescaleUnitsToNextSample = delta;
	                if (!this.isFragmented) {
	                    let lastTableEntry = last(trackData.timeToSampleTable);
	                    assert(lastTableEntry);
	                    if (lastTableEntry.sampleCount === 1) {
	                        lastTableEntry.sampleDelta = delta;
	                        const entryBefore = trackData.timeToSampleTable[trackData.timeToSampleTable.length - 2];
	                        if (entryBefore && entryBefore.sampleDelta === delta) {
	                            // If the delta is the same as the previous one, merge the two entries
	                            entryBefore.sampleCount++;
	                            trackData.timeToSampleTable.pop();
	                            lastTableEntry = entryBefore;
	                        }
	                    }
	                    else if (lastTableEntry.sampleDelta !== delta) {
	                        // The delta has changed, so we need a new entry to reach the current sample
	                        lastTableEntry.sampleCount--;
	                        trackData.timeToSampleTable.push(lastTableEntry = {
	                            sampleCount: 1,
	                            sampleDelta: delta,
	                        });
	                    }
	                    if (lastTableEntry.sampleDelta === durationInTimescale) {
	                        // The sample's duration matches the delta, so we can increment the count
	                        lastTableEntry.sampleCount++;
	                    }
	                    else {
	                        // Add a new entry in order to maintain the last sample's true duration
	                        trackData.timeToSampleTable.push({
	                            sampleCount: 1,
	                            sampleDelta: durationInTimescale,
	                        });
	                    }
	                    const lastCompositionTimeOffsetTableEntry = last(trackData.compositionTimeOffsetTable);
	                    assert(lastCompositionTimeOffsetTableEntry);
	                    if (lastCompositionTimeOffsetTableEntry.sampleCompositionTimeOffset === sampleCompositionTimeOffset) {
	                        // Simply increment the count
	                        lastCompositionTimeOffsetTableEntry.sampleCount++;
	                    }
	                    else {
	                        // The composition time offset has changed, so create a new entry with the new composition time
	                        // offset
	                        trackData.compositionTimeOffsetTable.push({
	                            sampleCount: 1,
	                            sampleCompositionTimeOffset: sampleCompositionTimeOffset,
	                        });
	                    }
	                }
	            }
	            else {
	                // Decode timestamp of the first sample
	                trackData.lastTimescaleUnits = intoTimescale(sample.decodeTimestamp, trackData.timescale, false);
	                if (!this.isFragmented) {
	                    trackData.timeToSampleTable.push({
	                        sampleCount: 1,
	                        sampleDelta: durationInTimescale,
	                    });
	                    trackData.compositionTimeOffsetTable.push({
	                        sampleCount: 1,
	                        sampleCompositionTimeOffset: sampleCompositionTimeOffset,
	                    });
	                }
	            }
	            trackData.lastSample = sample;
	        }
	        trackData.timestampProcessingQueue.length = 0;
	        assert(trackData.lastSample);
	        assert(trackData.lastTimescaleUnits !== null);
	        if (nextSample !== undefined && trackData.lastSample.timescaleUnitsToNextSample === 0) {
	            assert(nextSample.type === 'key');
	            // Given the next sample, we can make a guess about the duration of the last sample. This avoids having
	            // the last sample's duration in each fragment be "0" for fragmented files. The guess we make here is
	            // actually correct most of the time, since typically, no delta frame with a lower timestamp follows the key
	            // frame (although it can happen).
	            const timescaleUnits = intoTimescale(nextSample.timestamp, trackData.timescale, false);
	            const delta = Math.round(timescaleUnits - trackData.lastTimescaleUnits);
	            trackData.lastSample.timescaleUnitsToNextSample = delta;
	        }
	    }
	    async registerSample(trackData, sample) {
	        if (sample.type === 'key') {
	            this.processTimestamps(trackData, sample);
	        }
	        trackData.timestampProcessingQueue.push(sample);
	        if (this.isFragmented) {
	            trackData.sampleQueue.push(sample);
	            await this.interleaveSamples();
	        }
	        else if (this.fastStart === 'reserve') {
	            await this.registerSampleFastStartReserve(trackData, sample);
	        }
	        else {
	            await this.addSampleToTrack(trackData, sample);
	        }
	    }
	    async addSampleToTrack(trackData, sample) {
	        if (!this.isFragmented) {
	            trackData.samples.push(sample);
	            if (this.fastStart === 'reserve') {
	                const maximumPacketCount = trackData.track.metadata.maximumPacketCount;
	                assert(maximumPacketCount !== undefined);
	                if (trackData.samples.length > maximumPacketCount) {
	                    throw new Error(`Track #${trackData.track.id} has already reached the maximum packet count`
	                        + ` (${maximumPacketCount}). Either add less packets or increase the maximum packet count.`);
	                }
	            }
	        }
	        let beginNewChunk = false;
	        if (!trackData.currentChunk) {
	            beginNewChunk = true;
	        }
	        else {
	            // Timestamp don't need to be monotonic (think B-frames), so we may need to update the start timestamp of
	            // the chunk
	            trackData.currentChunk.startTimestamp = Math.min(trackData.currentChunk.startTimestamp, sample.timestamp);
	            const currentChunkDuration = sample.timestamp - trackData.currentChunk.startTimestamp;
	            if (this.isFragmented) {
	                // We can only finalize this fragment (and begin a new one) if we know that each track will be able to
	                // start the new one with a key frame.
	                const keyFrameQueuedEverywhere = this.trackDatas.every((otherTrackData) => {
	                    if (trackData === otherTrackData) {
	                        return sample.type === 'key';
	                    }
	                    const firstQueuedSample = otherTrackData.sampleQueue[0];
	                    if (firstQueuedSample) {
	                        return firstQueuedSample.type === 'key';
	                    }
	                    return otherTrackData.track.source._closed;
	                });
	                if (currentChunkDuration >= this.minimumFragmentDuration
	                    && keyFrameQueuedEverywhere
	                    && sample.timestamp > this.maxWrittenTimestamp) {
	                    beginNewChunk = true;
	                    await this.finalizeFragment();
	                }
	            }
	            else {
	                beginNewChunk = currentChunkDuration >= 0.5; // Chunk is long enough, we need a new one
	            }
	        }
	        if (beginNewChunk) {
	            if (trackData.currentChunk) {
	                await this.finalizeCurrentChunk(trackData);
	            }
	            trackData.currentChunk = {
	                startTimestamp: sample.timestamp,
	                samples: [],
	                offset: null,
	                moofOffset: null,
	            };
	        }
	        assert(trackData.currentChunk);
	        trackData.currentChunk.samples.push(sample);
	        if (this.isFragmented) {
	            this.maxWrittenTimestamp = Math.max(this.maxWrittenTimestamp, sample.timestamp);
	        }
	    }
	    async finalizeCurrentChunk(trackData) {
	        assert(!this.isFragmented);
	        if (!trackData.currentChunk)
	            return;
	        trackData.finalizedChunks.push(trackData.currentChunk);
	        this.finalizedChunks.push(trackData.currentChunk);
	        let sampleCount = trackData.currentChunk.samples.length;
	        if (trackData.type === 'audio' && trackData.info.requiresPcmTransformation) {
	            sampleCount = trackData.currentChunk.samples
	                .reduce((acc, sample) => acc + intoTimescale(sample.duration, trackData.timescale), 0);
	        }
	        if (trackData.compactlyCodedChunkTable.length === 0
	            || last(trackData.compactlyCodedChunkTable).samplesPerChunk !== sampleCount) {
	            trackData.compactlyCodedChunkTable.push({
	                firstChunk: trackData.finalizedChunks.length, // 1-indexed
	                samplesPerChunk: sampleCount,
	            });
	        }
	        if (this.fastStart === 'in-memory') {
	            trackData.currentChunk.offset = 0; // We'll compute the proper offset when finalizing
	            return;
	        }
	        // Write out the data
	        trackData.currentChunk.offset = this.writer.getPos();
	        for (const sample of trackData.currentChunk.samples) {
	            assert(sample.data);
	            this.writer.write(sample.data);
	            sample.data = null; // Can be GC'd
	        }
	        await this.writer.flush();
	    }
	    async interleaveSamples(isFinalCall = false) {
	        assert(this.isFragmented);
	        if (!isFinalCall && !this.allTracksAreKnown()) {
	            return; // We can't interleave yet as we don't yet know how many tracks we'll truly have
	        }
	        outer: while (true) {
	            let trackWithMinTimestamp = null;
	            let minTimestamp = Infinity;
	            for (const trackData of this.trackDatas) {
	                if (!isFinalCall && trackData.sampleQueue.length === 0 && !trackData.track.source._closed) {
	                    break outer;
	                }
	                if (trackData.sampleQueue.length > 0 && trackData.sampleQueue[0].timestamp < minTimestamp) {
	                    trackWithMinTimestamp = trackData;
	                    minTimestamp = trackData.sampleQueue[0].timestamp;
	                }
	            }
	            if (!trackWithMinTimestamp) {
	                break;
	            }
	            const sample = trackWithMinTimestamp.sampleQueue.shift();
	            await this.addSampleToTrack(trackWithMinTimestamp, sample);
	        }
	    }
	    async finalizeFragment(flushWriter = true) {
	        assert(this.isFragmented);
	        const fragmentNumber = this.nextFragmentNumber++;
	        if (fragmentNumber === 1) {
	            if (this.format._options.onMoov) {
	                this.writer.startTrackingWrites();
	            }
	            // Write the moov box now that we have all decoder configs
	            const movieBox = moov(this);
	            this.boxWriter.writeBox(movieBox);
	            if (this.format._options.onMoov) {
	                const { data, start } = this.writer.stopTrackingWrites();
	                this.format._options.onMoov(data, start);
	            }
	        }
	        // Not all tracks need to be present in every fragment
	        const tracksInFragment = this.trackDatas.filter(x => x.currentChunk);
	        // Create an initial moof box and measure it; we need this to know where the following mdat box will begin
	        const moofBox = moof(fragmentNumber, tracksInFragment);
	        const moofOffset = this.writer.getPos();
	        const mdatStartPos = moofOffset + this.boxWriter.measureBox(moofBox);
	        let currentPos = mdatStartPos + MIN_BOX_HEADER_SIZE;
	        let fragmentStartTimestamp = Infinity;
	        for (const trackData of tracksInFragment) {
	            trackData.currentChunk.offset = currentPos;
	            trackData.currentChunk.moofOffset = moofOffset;
	            for (const sample of trackData.currentChunk.samples) {
	                currentPos += sample.size;
	            }
	            fragmentStartTimestamp = Math.min(fragmentStartTimestamp, trackData.currentChunk.startTimestamp);
	        }
	        const mdatSize = currentPos - mdatStartPos;
	        const needsLargeMdatSize = mdatSize >= 2 ** 32;
	        if (needsLargeMdatSize) {
	            // Shift all offsets by 8. Previously, all chunks were shifted assuming the large box size, but due to what
	            // I suspect is a bug in WebKit, it failed in Safari (when livestreaming with MSE, not for static playback).
	            for (const trackData of tracksInFragment) {
	                trackData.currentChunk.offset += MAX_BOX_HEADER_SIZE - MIN_BOX_HEADER_SIZE;
	            }
	        }
	        if (this.format._options.onMoof) {
	            this.writer.startTrackingWrites();
	        }
	        const newMoofBox = moof(fragmentNumber, tracksInFragment);
	        this.boxWriter.writeBox(newMoofBox);
	        if (this.format._options.onMoof) {
	            const { data, start } = this.writer.stopTrackingWrites();
	            this.format._options.onMoof(data, start, fragmentStartTimestamp);
	        }
	        assert(this.writer.getPos() === mdatStartPos);
	        if (this.format._options.onMdat) {
	            this.writer.startTrackingWrites();
	        }
	        const mdatBox = mdat(needsLargeMdatSize);
	        mdatBox.size = mdatSize;
	        this.boxWriter.writeBox(mdatBox);
	        this.writer.seek(mdatStartPos + (needsLargeMdatSize ? MAX_BOX_HEADER_SIZE : MIN_BOX_HEADER_SIZE));
	        // Write sample data
	        for (const trackData of tracksInFragment) {
	            for (const sample of trackData.currentChunk.samples) {
	                this.writer.write(sample.data);
	                sample.data = null; // Can be GC'd
	            }
	        }
	        if (this.format._options.onMdat) {
	            const { data, start } = this.writer.stopTrackingWrites();
	            this.format._options.onMdat(data, start);
	        }
	        for (const trackData of tracksInFragment) {
	            trackData.finalizedChunks.push(trackData.currentChunk);
	            this.finalizedChunks.push(trackData.currentChunk);
	            trackData.currentChunk = null;
	        }
	        if (flushWriter) {
	            await this.writer.flush();
	        }
	    }
	    async registerSampleFastStartReserve(trackData, sample) {
	        if (this.allTracksAreKnown()) {
	            if (!this.mdat) {
	                // We finally know all tracks, let's reserve space for the moov box
	                const moovBox = moov(this);
	                const moovSize = this.boxWriter.measureBox(moovBox);
	                const reservedSize = moovSize
	                    + this.computeSampleTableSizeUpperBound()
	                    + 4096; // Just a little extra headroom
	                assert(this.ftypSize !== null);
	                this.writer.seek(this.ftypSize + reservedSize);
	                if (this.format._options.onMdat) {
	                    this.writer.startTrackingWrites();
	                }
	                this.mdat = mdat(true);
	                this.boxWriter.writeBox(this.mdat);
	                // Now write everything that was queued
	                for (const trackData of this.trackDatas) {
	                    for (const sample of trackData.sampleQueue) {
	                        await this.addSampleToTrack(trackData, sample);
	                    }
	                    trackData.sampleQueue.length = 0;
	                }
	            }
	            await this.addSampleToTrack(trackData, sample);
	        }
	        else {
	            // Queue it for when we know all tracks
	            trackData.sampleQueue.push(sample);
	        }
	    }
	    computeSampleTableSizeUpperBound() {
	        assert(this.fastStart === 'reserve');
	        let upperBound = 0;
	        for (const trackData of this.trackDatas) {
	            const n = trackData.track.metadata.maximumPacketCount;
	            assert(n !== undefined); // We validated this earlier
	            // Given the max allowed packet count, compute the space they'll take up in the Sample Table Box, assuming
	            // the worst case for each individual box:
	            // stts box - since it is compactly coded, the maximum length of this table will be 2/3n
	            upperBound += (4 + 4) * Math.ceil(2 / 3 * n);
	            // stss box - 1 entry per sample
	            upperBound += 4 * n;
	            // ctts box - since it is compactly coded, the maximum length of this table will be 2/3n
	            upperBound += (4 + 4) * Math.ceil(2 / 3 * n);
	            // stsc box - since it is compactly coded, the maximum length of this table will be 2/3n
	            upperBound += (4 + 4 + 4) * Math.ceil(2 / 3 * n);
	            // stsz box - 1 entry per sample
	            upperBound += 4 * n;
	            // co64 box - we assume 1 sample per chunk and 64-bit chunk offsets (co64 instead of stco)
	            upperBound += 8 * n;
	        }
	        return upperBound;
	    }
	    // eslint-disable-next-line @typescript-eslint/no-misused-promises
	    async onTrackClose(track) {
	        const release = await this.mutex.acquire();
	        if (track.type === 'subtitle' && track.source._codec === 'webvtt') {
	            const trackData = this.trackDatas.find(x => x.track === track);
	            if (trackData) {
	                await this.processWebVTTCues(trackData, Infinity);
	            }
	        }
	        if (this.allTracksAreKnown()) {
	            this.allTracksKnown.resolve();
	        }
	        if (this.isFragmented) {
	            // Since a track is now closed, we may be able to write out chunks that were previously waiting
	            await this.interleaveSamples();
	        }
	        release();
	    }
	    /** Finalizes the file, making it ready for use. Must be called after all video and audio chunks have been added. */
	    async finalize() {
	        const release = await this.mutex.acquire();
	        this.allTracksKnown.resolve();
	        for (const trackData of this.trackDatas) {
	            if (trackData.type === 'subtitle' && trackData.track.source._codec === 'webvtt') {
	                await this.processWebVTTCues(trackData, Infinity);
	            }
	        }
	        if (this.isFragmented) {
	            await this.interleaveSamples(true);
	            for (const trackData of this.trackDatas) {
	                this.processTimestamps(trackData);
	            }
	            await this.finalizeFragment(false); // Don't flush the last fragment as we will flush it with the mfra box
	        }
	        else {
	            for (const trackData of this.trackDatas) {
	                this.processTimestamps(trackData);
	                await this.finalizeCurrentChunk(trackData);
	            }
	        }
	        if (this.fastStart === 'in-memory') {
	            this.mdat = mdat(false);
	            let mdatSize;
	            // We know how many chunks there are, but computing the chunk positions requires an iterative approach:
	            // In order to know where the first chunk should go, we first need to know the size of the moov box. But we
	            // cannot write a proper moov box without first knowing all chunk positions. So, we generate a tentative
	            // moov box with placeholder values (0) for the chunk offsets to be able to compute its size. If it then
	            // turns out that appending all chunks exceeds 4 GiB, we need to repeat this process, now with the co64 box
	            // being used in the moov box instead, which will make it larger. After that, we definitely know the final
	            // size of the moov box and can compute the proper chunk positions.
	            for (let i = 0; i < 2; i++) {
	                const movieBox = moov(this);
	                const movieBoxSize = this.boxWriter.measureBox(movieBox);
	                mdatSize = this.boxWriter.measureBox(this.mdat);
	                let currentChunkPos = this.writer.getPos() + movieBoxSize + mdatSize;
	                for (const chunk of this.finalizedChunks) {
	                    chunk.offset = currentChunkPos;
	                    for (const { data } of chunk.samples) {
	                        assert(data);
	                        currentChunkPos += data.byteLength;
	                        mdatSize += data.byteLength;
	                    }
	                }
	                if (currentChunkPos < 2 ** 32)
	                    break;
	                if (mdatSize >= 2 ** 32)
	                    this.mdat.largeSize = true;
	            }
	            if (this.format._options.onMoov) {
	                this.writer.startTrackingWrites();
	            }
	            const movieBox = moov(this);
	            this.boxWriter.writeBox(movieBox);
	            if (this.format._options.onMoov) {
	                const { data, start } = this.writer.stopTrackingWrites();
	                this.format._options.onMoov(data, start);
	            }
	            if (this.format._options.onMdat) {
	                this.writer.startTrackingWrites();
	            }
	            this.mdat.size = mdatSize;
	            this.boxWriter.writeBox(this.mdat);
	            for (const chunk of this.finalizedChunks) {
	                for (const sample of chunk.samples) {
	                    assert(sample.data);
	                    this.writer.write(sample.data);
	                    sample.data = null;
	                }
	            }
	            if (this.format._options.onMdat) {
	                const { data, start } = this.writer.stopTrackingWrites();
	                this.format._options.onMdat(data, start);
	            }
	        }
	        else if (this.isFragmented) {
	            // Append the mfra box to the end of the file for better random access
	            const startPos = this.writer.getPos();
	            const mfraBox = mfra(this.trackDatas);
	            this.boxWriter.writeBox(mfraBox);
	            // Patch the 'size' field of the mfro box at the end of the mfra box now that we know its actual size
	            const mfraBoxSize = this.writer.getPos() - startPos;
	            this.writer.seek(this.writer.getPos() - 4);
	            this.boxWriter.writeU32(mfraBoxSize);
	        }
	        else {
	            assert(this.mdat);
	            const mdatPos = this.boxWriter.offsets.get(this.mdat);
	            assert(mdatPos !== undefined);
	            const mdatSize = this.writer.getPos() - mdatPos;
	            this.mdat.size = mdatSize;
	            this.mdat.largeSize = mdatSize >= 2 ** 32; // Only use the large size if we need it
	            this.boxWriter.patchBox(this.mdat);
	            if (this.format._options.onMdat) {
	                const { data, start } = this.writer.stopTrackingWrites();
	                this.format._options.onMdat(data, start);
	            }
	            const movieBox = moov(this);
	            if (this.fastStart === 'reserve') {
	                assert(this.ftypSize !== null);
	                this.writer.seek(this.ftypSize);
	                if (this.format._options.onMoov) {
	                    this.writer.startTrackingWrites();
	                }
	                this.boxWriter.writeBox(movieBox);
	                // Fill the remaining space with a free box. If there are less than 8 bytes left, sucks I guess
	                const remainingSpace = this.boxWriter.offsets.get(this.mdat) - this.writer.getPos();
	                this.boxWriter.writeBox(free(remainingSpace));
	            }
	            else {
	                if (this.format._options.onMoov) {
	                    this.writer.startTrackingWrites();
	                }
	                this.boxWriter.writeBox(movieBox);
	            }
	            if (this.format._options.onMoov) {
	                const { data, start } = this.writer.stopTrackingWrites();
	                this.format._options.onMoov(data, start);
	            }
	        }
	        release();
	    }
	}

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	const MIN_CLUSTER_TIMESTAMP_MS = -32768;
	const MAX_CLUSTER_TIMESTAMP_MS = 2 ** 15 - 1;
	const APP_NAME = 'Mediabunny';
	const SEGMENT_SIZE_BYTES = 6;
	const CLUSTER_SIZE_BYTES = 5;
	const TRACK_TYPE_MAP = {
	    video: 1,
	    audio: 2,
	    subtitle: 17,
	};
	class MatroskaMuxer extends Muxer {
	    constructor(output, format) {
	        super(output);
	        this.trackDatas = [];
	        this.allTracksKnown = promiseWithResolvers();
	        this.segment = null;
	        this.segmentInfo = null;
	        this.seekHead = null;
	        this.tracksElement = null;
	        this.tagsElement = null;
	        this.attachmentsElement = null;
	        this.segmentDuration = null;
	        this.cues = null;
	        this.currentCluster = null;
	        this.currentClusterStartMsTimestamp = null;
	        this.currentClusterMaxMsTimestamp = null;
	        this.trackDatasInCurrentCluster = new Map();
	        this.duration = 0;
	        this.writer = output._writer;
	        this.format = format;
	        this.ebmlWriter = new EBMLWriter(this.writer);
	        if (this.format._options.appendOnly) {
	            this.writer.ensureMonotonicity = true;
	        }
	    }
	    async start() {
	        const release = await this.mutex.acquire();
	        this.writeEBMLHeader();
	        this.createSegmentInfo();
	        this.createCues();
	        await this.writer.flush();
	        release();
	    }
	    writeEBMLHeader() {
	        if (this.format._options.onEbmlHeader) {
	            this.writer.startTrackingWrites();
	        }
	        const ebmlHeader = { id: EBMLId.EBML, data: [
	                { id: EBMLId.EBMLVersion, data: 1 },
	                { id: EBMLId.EBMLReadVersion, data: 1 },
	                { id: EBMLId.EBMLMaxIDLength, data: 4 },
	                { id: EBMLId.EBMLMaxSizeLength, data: 8 },
	                { id: EBMLId.DocType, data: this.format instanceof WebMOutputFormat ? 'webm' : 'matroska' },
	                { id: EBMLId.DocTypeVersion, data: 2 },
	                { id: EBMLId.DocTypeReadVersion, data: 2 },
	            ] };
	        this.ebmlWriter.writeEBML(ebmlHeader);
	        if (this.format._options.onEbmlHeader) {
	            const { data, start } = this.writer.stopTrackingWrites(); // start should be 0
	            this.format._options.onEbmlHeader(data, start);
	        }
	    }
	    /**
	     * Creates a SeekHead element which is positioned near the start of the file and allows the media player to seek to
	     * relevant sections more easily. Since we don't know the positions of those sections yet, we'll set them later.
	     */
	    maybeCreateSeekHead(writeOffsets) {
	        if (this.format._options.appendOnly) {
	            return;
	        }
	        const kaxCues = new Uint8Array([0x1c, 0x53, 0xbb, 0x6b]);
	        const kaxInfo = new Uint8Array([0x15, 0x49, 0xa9, 0x66]);
	        const kaxTracks = new Uint8Array([0x16, 0x54, 0xae, 0x6b]);
	        const kaxAttachments = new Uint8Array([0x19, 0x41, 0xa4, 0x69]);
	        const kaxTags = new Uint8Array([0x12, 0x54, 0xc3, 0x67]);
	        const seekHead = { id: EBMLId.SeekHead, data: [
	                { id: EBMLId.Seek, data: [
	                        { id: EBMLId.SeekID, data: kaxCues },
	                        {
	                            id: EBMLId.SeekPosition,
	                            size: 5,
	                            data: writeOffsets
	                                ? this.ebmlWriter.offsets.get(this.cues) - this.segmentDataOffset
	                                : 0,
	                        },
	                    ] },
	                { id: EBMLId.Seek, data: [
	                        { id: EBMLId.SeekID, data: kaxInfo },
	                        {
	                            id: EBMLId.SeekPosition,
	                            size: 5,
	                            data: writeOffsets
	                                ? this.ebmlWriter.offsets.get(this.segmentInfo) - this.segmentDataOffset
	                                : 0,
	                        },
	                    ] },
	                { id: EBMLId.Seek, data: [
	                        { id: EBMLId.SeekID, data: kaxTracks },
	                        {
	                            id: EBMLId.SeekPosition,
	                            size: 5,
	                            data: writeOffsets
	                                ? this.ebmlWriter.offsets.get(this.tracksElement) - this.segmentDataOffset
	                                : 0,
	                        },
	                    ] },
	                this.attachmentsElement
	                    ? { id: EBMLId.Seek, data: [
	                            { id: EBMLId.SeekID, data: kaxAttachments },
	                            {
	                                id: EBMLId.SeekPosition,
	                                size: 5,
	                                data: writeOffsets
	                                    ? this.ebmlWriter.offsets.get(this.attachmentsElement) - this.segmentDataOffset
	                                    : 0,
	                            },
	                        ] }
	                    : null,
	                this.tagsElement
	                    ? { id: EBMLId.Seek, data: [
	                            { id: EBMLId.SeekID, data: kaxTags },
	                            {
	                                id: EBMLId.SeekPosition,
	                                size: 5,
	                                data: writeOffsets
	                                    ? this.ebmlWriter.offsets.get(this.tagsElement) - this.segmentDataOffset
	                                    : 0,
	                            },
	                        ] }
	                    : null,
	            ] };
	        this.seekHead = seekHead;
	    }
	    createSegmentInfo() {
	        const segmentDuration = { id: EBMLId.Duration, data: new EBMLFloat64(0) };
	        this.segmentDuration = segmentDuration;
	        const segmentInfo = { id: EBMLId.Info, data: [
	                { id: EBMLId.TimestampScale, data: 1e6 },
	                { id: EBMLId.MuxingApp, data: APP_NAME },
	                { id: EBMLId.WritingApp, data: APP_NAME },
	                !this.format._options.appendOnly ? segmentDuration : null,
	            ] };
	        this.segmentInfo = segmentInfo;
	    }
	    createTracks() {
	        const tracksElement = { id: EBMLId.Tracks, data: [] };
	        this.tracksElement = tracksElement;
	        for (const trackData of this.trackDatas) {
	            const codecId = CODEC_STRING_MAP[trackData.track.source._codec];
	            assert(codecId);
	            let seekPreRollNs = 0;
	            if (trackData.type === 'audio' && trackData.track.source._codec === 'opus') {
	                seekPreRollNs = 1e6 * 80; // In "Matroska ticks" (nanoseconds)
	                const description = trackData.info.decoderConfig.description;
	                if (description) {
	                    const bytes = toUint8Array(description);
	                    const header = parseOpusIdentificationHeader(bytes);
	                    // Use the preSkip value from the header
	                    seekPreRollNs = Math.round(1e9 * (header.preSkip / OPUS_SAMPLE_RATE));
	                }
	            }
	            tracksElement.data.push({ id: EBMLId.TrackEntry, data: [
	                    { id: EBMLId.TrackNumber, data: trackData.track.id },
	                    { id: EBMLId.TrackUID, data: trackData.track.id },
	                    { id: EBMLId.TrackType, data: TRACK_TYPE_MAP[trackData.type] },
	                    { id: EBMLId.FlagLacing, data: 0 },
	                    { id: EBMLId.Language, data: trackData.track.metadata.languageCode ?? UNDETERMINED_LANGUAGE },
	                    { id: EBMLId.CodecID, data: codecId },
	                    { id: EBMLId.CodecDelay, data: 0 },
	                    { id: EBMLId.SeekPreRoll, data: seekPreRollNs },
	                    trackData.track.metadata.name !== undefined
	                        ? { id: EBMLId.Name, data: new EBMLUnicodeString(trackData.track.metadata.name) }
	                        : null,
	                    (trackData.type === 'video' ? this.videoSpecificTrackInfo(trackData) : null),
	                    (trackData.type === 'audio' ? this.audioSpecificTrackInfo(trackData) : null),
	                    (trackData.type === 'subtitle' ? this.subtitleSpecificTrackInfo(trackData) : null),
	                ] });
	        }
	    }
	    videoSpecificTrackInfo(trackData) {
	        const { frameRate, rotation } = trackData.track.metadata;
	        const elements = [
	            (trackData.info.decoderConfig.description
	                ? {
	                    id: EBMLId.CodecPrivate,
	                    data: toUint8Array(trackData.info.decoderConfig.description),
	                }
	                : null),
	            (frameRate
	                ? {
	                    id: EBMLId.DefaultDuration,
	                    data: 1e9 / frameRate,
	                }
	                : null),
	        ];
	        // Convert from clockwise to counter-clockwise
	        const flippedRotation = rotation ? normalizeRotation(-rotation) : 0;
	        const colorSpace = trackData.info.decoderConfig.colorSpace;
	        const videoElement = { id: EBMLId.Video, data: [
	                { id: EBMLId.PixelWidth, data: trackData.info.width },
	                { id: EBMLId.PixelHeight, data: trackData.info.height },
	                trackData.info.alphaMode ? { id: EBMLId.AlphaMode, data: 1 } : null,
	                (colorSpaceIsComplete(colorSpace)
	                    ? {
	                        id: EBMLId.Colour,
	                        data: [
	                            {
	                                id: EBMLId.MatrixCoefficients,
	                                data: MATRIX_COEFFICIENTS_MAP[colorSpace.matrix],
	                            },
	                            {
	                                id: EBMLId.TransferCharacteristics,
	                                data: TRANSFER_CHARACTERISTICS_MAP[colorSpace.transfer],
	                            },
	                            {
	                                id: EBMLId.Primaries,
	                                data: COLOR_PRIMARIES_MAP[colorSpace.primaries],
	                            },
	                            {
	                                id: EBMLId.Range,
	                                data: colorSpace.fullRange ? 2 : 1,
	                            },
	                        ],
	                    }
	                    : null),
	                (flippedRotation
	                    ? {
	                        id: EBMLId.Projection,
	                        data: [
	                            {
	                                id: EBMLId.ProjectionType,
	                                data: 0, // rectangular
	                            },
	                            {
	                                id: EBMLId.ProjectionPoseRoll,
	                                data: new EBMLFloat32((flippedRotation + 180) % 360 - 180), // [0, 270] -> [-180, 90]
	                            },
	                        ],
	                    }
	                    : null),
	            ] };
	        elements.push(videoElement);
	        return elements;
	    }
	    audioSpecificTrackInfo(trackData) {
	        const pcmInfo = PCM_AUDIO_CODECS.includes(trackData.track.source._codec)
	            ? parsePcmCodec(trackData.track.source._codec)
	            : null;
	        return [
	            (trackData.info.decoderConfig.description
	                ? {
	                    id: EBMLId.CodecPrivate,
	                    data: toUint8Array(trackData.info.decoderConfig.description),
	                }
	                : null),
	            { id: EBMLId.Audio, data: [
	                    { id: EBMLId.SamplingFrequency, data: new EBMLFloat32(trackData.info.sampleRate) },
	                    { id: EBMLId.Channels, data: trackData.info.numberOfChannels },
	                    pcmInfo ? { id: EBMLId.BitDepth, data: 8 * pcmInfo.sampleSize } : null,
	                ] },
	        ];
	    }
	    subtitleSpecificTrackInfo(trackData) {
	        return [
	            { id: EBMLId.CodecPrivate, data: textEncoder.encode(trackData.info.config.description) },
	        ];
	    }
	    maybeCreateTags() {
	        const simpleTags = [];
	        const addSimpleTag = (key, value) => {
	            simpleTags.push({ id: EBMLId.SimpleTag, data: [
	                    { id: EBMLId.TagName, data: new EBMLUnicodeString(key) },
	                    typeof value === 'string'
	                        ? { id: EBMLId.TagString, data: new EBMLUnicodeString(value) }
	                        : { id: EBMLId.TagBinary, data: value },
	                ] });
	        };
	        const metadataTags = this.output._metadataTags;
	        const writtenTags = new Set();
	        for (const { key, value } of keyValueIterator(metadataTags)) {
	            switch (key) {
	                case 'title':
	                    {
	                        addSimpleTag('TITLE', value);
	                        writtenTags.add('TITLE');
	                    }
	                    break;
	                case 'description':
	                    {
	                        addSimpleTag('DESCRIPTION', value);
	                        writtenTags.add('DESCRIPTION');
	                    }
	                    break;
	                case 'artist':
	                    {
	                        addSimpleTag('ARTIST', value);
	                        writtenTags.add('ARTIST');
	                    }
	                    break;
	                case 'album':
	                    {
	                        addSimpleTag('ALBUM', value);
	                        writtenTags.add('ALBUM');
	                    }
	                    break;
	                case 'albumArtist':
	                    {
	                        addSimpleTag('ALBUM_ARTIST', value);
	                        writtenTags.add('ALBUM_ARTIST');
	                    }
	                    break;
	                case 'genre':
	                    {
	                        addSimpleTag('GENRE', value);
	                        writtenTags.add('GENRE');
	                    }
	                    break;
	                case 'comment':
	                    {
	                        addSimpleTag('COMMENT', value);
	                        writtenTags.add('COMMENT');
	                    }
	                    break;
	                case 'lyrics':
	                    {
	                        addSimpleTag('LYRICS', value);
	                        writtenTags.add('LYRICS');
	                    }
	                    break;
	                case 'date':
	                    {
	                        addSimpleTag('DATE', value.toISOString().slice(0, 10));
	                        writtenTags.add('DATE');
	                    }
	                    break;
	                case 'trackNumber':
	                    {
	                        const string = metadataTags.tracksTotal !== undefined
	                            ? `${value}/${metadataTags.tracksTotal}`
	                            : value.toString();
	                        addSimpleTag('PART_NUMBER', string);
	                        writtenTags.add('PART_NUMBER');
	                    }
	                    break;
	                case 'discNumber':
	                    {
	                        const string = metadataTags.discsTotal !== undefined
	                            ? `${value}/${metadataTags.discsTotal}`
	                            : value.toString();
	                        addSimpleTag('DISC', string);
	                        writtenTags.add('DISC');
	                    }
	                    break;
	                case 'tracksTotal':
	                case 'discsTotal':
	                    break;
	                case 'images':
	                case 'raw':
	                    break;
	                default: assertNever(key);
	            }
	        }
	        if (metadataTags.raw) {
	            for (const key in metadataTags.raw) {
	                const value = metadataTags.raw[key];
	                if (value == null || writtenTags.has(key)) {
	                    continue;
	                }
	                if (typeof value === 'string' || value instanceof Uint8Array) {
	                    addSimpleTag(key, value);
	                }
	            }
	        }
	        if (simpleTags.length === 0) {
	            return;
	        }
	        this.tagsElement = {
	            id: EBMLId.Tags,
	            data: [{ id: EBMLId.Tag, data: [
	                        { id: EBMLId.Targets, data: [
	                                { id: EBMLId.TargetTypeValue, data: 50 },
	                                { id: EBMLId.TargetType, data: 'MOVIE' },
	                            ] },
	                        ...simpleTags,
	                    ] }],
	        };
	    }
	    maybeCreateAttachments() {
	        const metadataTags = this.output._metadataTags;
	        const elements = [];
	        const existingFileUids = new Set();
	        const images = metadataTags.images ?? [];
	        for (const image of images) {
	            let imageName = image.name;
	            if (imageName === undefined) {
	                const baseName = image.kind === 'coverFront' ? 'cover' : image.kind === 'coverBack' ? 'back' : 'image';
	                imageName = baseName + (imageMimeTypeToExtension(image.mimeType) ?? '');
	            }
	            let fileUid;
	            while (true) {
	                // Generate a random 64-bit unsigned integer
	                fileUid = 0n;
	                for (let i = 0; i < 8; i++) {
	                    fileUid <<= 8n;
	                    fileUid |= BigInt(Math.floor(Math.random() * 256));
	                }
	                if (fileUid !== 0n && !existingFileUids.has(fileUid)) {
	                    break;
	                }
	            }
	            existingFileUids.add(fileUid);
	            elements.push({
	                id: EBMLId.AttachedFile,
	                data: [
	                    image.description !== undefined
	                        ? { id: EBMLId.FileDescription, data: new EBMLUnicodeString(image.description) }
	                        : null,
	                    { id: EBMLId.FileName, data: new EBMLUnicodeString(imageName) },
	                    { id: EBMLId.FileMediaType, data: image.mimeType },
	                    { id: EBMLId.FileData, data: image.data },
	                    { id: EBMLId.FileUID, data: fileUid },
	                ],
	            });
	        }
	        // Add all AttachedFiles from the raw metadata
	        for (const [key, value] of Object.entries(metadataTags.raw ?? {})) {
	            if (!(value instanceof AttachedFile)) {
	                continue;
	            }
	            const keyIsNumeric = /^\d+$/.test(key);
	            if (!keyIsNumeric) {
	                continue;
	            }
	            if (images.find(x => x.mimeType === value.mimeType && uint8ArraysAreEqual(x.data, value.data))) {
	                // This attached file has very likely already been added as an image above
	                // (happens when remuxing Matroska)
	                continue;
	            }
	            elements.push({
	                id: EBMLId.AttachedFile,
	                data: [
	                    value.description !== undefined
	                        ? { id: EBMLId.FileDescription, data: new EBMLUnicodeString(value.description) }
	                        : null,
	                    { id: EBMLId.FileName, data: new EBMLUnicodeString(value.name ?? '') },
	                    { id: EBMLId.FileMediaType, data: value.mimeType ?? '' },
	                    { id: EBMLId.FileData, data: value.data },
	                    { id: EBMLId.FileUID, data: BigInt(key) },
	                ],
	            });
	        }
	        if (elements.length === 0) {
	            return;
	        }
	        this.attachmentsElement = { id: EBMLId.Attachments, data: elements };
	    }
	    createSegment() {
	        this.createTracks();
	        this.maybeCreateTags();
	        this.maybeCreateAttachments();
	        this.maybeCreateSeekHead(false);
	        const segment = {
	            id: EBMLId.Segment,
	            size: this.format._options.appendOnly ? -1 : SEGMENT_SIZE_BYTES,
	            data: [
	                this.seekHead, // null if append-only
	                this.segmentInfo,
	                this.tracksElement,
	                // Matroska spec says put this at the end of the file, but I think placing it before the first cluster
	                // makes more sense, and FFmpeg agrees (argumentum ad ffmpegum fallacy)
	                this.attachmentsElement,
	                this.tagsElement,
	            ],
	        };
	        this.segment = segment;
	        if (this.format._options.onSegmentHeader) {
	            this.writer.startTrackingWrites();
	        }
	        this.ebmlWriter.writeEBML(segment);
	        if (this.format._options.onSegmentHeader) {
	            const { data, start } = this.writer.stopTrackingWrites();
	            this.format._options.onSegmentHeader(data, start);
	        }
	    }
	    createCues() {
	        this.cues = { id: EBMLId.Cues, data: [] };
	    }
	    get segmentDataOffset() {
	        assert(this.segment);
	        return this.ebmlWriter.dataOffsets.get(this.segment);
	    }
	    allTracksAreKnown() {
	        for (const track of this.output._tracks) {
	            if (!track.source._closed && !this.trackDatas.some(x => x.track === track)) {
	                return false; // We haven't seen a sample from this open track yet
	            }
	        }
	        return true;
	    }
	    async getMimeType() {
	        await this.allTracksKnown.promise;
	        const codecStrings = this.trackDatas.map((trackData) => {
	            if (trackData.type === 'video') {
	                return trackData.info.decoderConfig.codec;
	            }
	            else if (trackData.type === 'audio') {
	                return trackData.info.decoderConfig.codec;
	            }
	            else {
	                const map = {
	                    webvtt: 'wvtt',
	                };
	                return map[trackData.track.source._codec];
	            }
	        });
	        return buildMatroskaMimeType({
	            isWebM: this.format instanceof WebMOutputFormat,
	            hasVideo: this.trackDatas.some(x => x.type === 'video'),
	            hasAudio: this.trackDatas.some(x => x.type === 'audio'),
	            codecStrings,
	        });
	    }
	    getVideoTrackData(track, packet, meta) {
	        const existingTrackData = this.trackDatas.find(x => x.track === track);
	        if (existingTrackData) {
	            return existingTrackData;
	        }
	        validateVideoChunkMetadata(meta);
	        assert(meta);
	        assert(meta.decoderConfig);
	        assert(meta.decoderConfig.codedWidth !== undefined);
	        assert(meta.decoderConfig.codedHeight !== undefined);
	        const newTrackData = {
	            track,
	            type: 'video',
	            info: {
	                width: meta.decoderConfig.codedWidth,
	                height: meta.decoderConfig.codedHeight,
	                decoderConfig: meta.decoderConfig,
	                alphaMode: !!packet.sideData.alpha, // The first packet determines if this track has alpha or not
	            },
	            chunkQueue: [],
	            lastWrittenMsTimestamp: null,
	        };
	        if (track.source._codec === 'vp9') {
	            // https://www.webmproject.org/docs/container specifies that VP9 "SHOULD" make use of the CodecPrivate
	            // field. Since WebCodecs makes no use of the description field for VP9, we need to derive it ourselves:
	            newTrackData.info.decoderConfig = {
	                ...newTrackData.info.decoderConfig,
	                description: new Uint8Array(generateVp9CodecConfigurationFromCodecString(newTrackData.info.decoderConfig.codec)),
	            };
	        }
	        else if (track.source._codec === 'av1') {
	            // Per https://github.com/ietf-wg-cellar/matroska-specification/blob/master/codec/av1.md, AV1 requires
	            // CodecPrivate to be set, but WebCodecs makes no use of the description field for AV1. Thus, let's derive
	            // it ourselves:
	            newTrackData.info.decoderConfig = {
	                ...newTrackData.info.decoderConfig,
	                description: new Uint8Array(generateAv1CodecConfigurationFromCodecString(newTrackData.info.decoderConfig.codec)),
	            };
	        }
	        this.trackDatas.push(newTrackData);
	        this.trackDatas.sort((a, b) => a.track.id - b.track.id);
	        if (this.allTracksAreKnown()) {
	            this.allTracksKnown.resolve();
	        }
	        return newTrackData;
	    }
	    getAudioTrackData(track, meta) {
	        const existingTrackData = this.trackDatas.find(x => x.track === track);
	        if (existingTrackData) {
	            return existingTrackData;
	        }
	        validateAudioChunkMetadata(meta);
	        assert(meta);
	        assert(meta.decoderConfig);
	        const newTrackData = {
	            track,
	            type: 'audio',
	            info: {
	                numberOfChannels: meta.decoderConfig.numberOfChannels,
	                sampleRate: meta.decoderConfig.sampleRate,
	                decoderConfig: meta.decoderConfig,
	            },
	            chunkQueue: [],
	            lastWrittenMsTimestamp: null,
	        };
	        this.trackDatas.push(newTrackData);
	        this.trackDatas.sort((a, b) => a.track.id - b.track.id);
	        if (this.allTracksAreKnown()) {
	            this.allTracksKnown.resolve();
	        }
	        return newTrackData;
	    }
	    getSubtitleTrackData(track, meta) {
	        const existingTrackData = this.trackDatas.find(x => x.track === track);
	        if (existingTrackData) {
	            return existingTrackData;
	        }
	        validateSubtitleMetadata(meta);
	        assert(meta);
	        assert(meta.config);
	        const newTrackData = {
	            track,
	            type: 'subtitle',
	            info: {
	                config: meta.config,
	            },
	            chunkQueue: [],
	            lastWrittenMsTimestamp: null,
	        };
	        this.trackDatas.push(newTrackData);
	        this.trackDatas.sort((a, b) => a.track.id - b.track.id);
	        if (this.allTracksAreKnown()) {
	            this.allTracksKnown.resolve();
	        }
	        return newTrackData;
	    }
	    async addEncodedVideoPacket(track, packet, meta) {
	        const release = await this.mutex.acquire();
	        try {
	            const trackData = this.getVideoTrackData(track, packet, meta);
	            const isKeyFrame = packet.type === 'key';
	            let timestamp = this.validateAndNormalizeTimestamp(trackData.track, packet.timestamp, isKeyFrame);
	            let duration = packet.duration;
	            if (track.metadata.frameRate !== undefined) {
	                // Constrain the time values to the frame rate
	                timestamp = roundToMultiple(timestamp, 1 / track.metadata.frameRate);
	                duration = roundToMultiple(duration, 1 / track.metadata.frameRate);
	            }
	            const additions = trackData.info.alphaMode
	                ? packet.sideData.alpha ?? null
	                : null;
	            const videoChunk = this.createInternalChunk(packet.data, timestamp, duration, packet.type, additions);
	            if (track.source._codec === 'vp9')
	                this.fixVP9ColorSpace(trackData, videoChunk);
	            trackData.chunkQueue.push(videoChunk);
	            await this.interleaveChunks();
	        }
	        finally {
	            release();
	        }
	    }
	    async addEncodedAudioPacket(track, packet, meta) {
	        const release = await this.mutex.acquire();
	        try {
	            const trackData = this.getAudioTrackData(track, meta);
	            const isKeyFrame = packet.type === 'key';
	            const timestamp = this.validateAndNormalizeTimestamp(trackData.track, packet.timestamp, isKeyFrame);
	            const audioChunk = this.createInternalChunk(packet.data, timestamp, packet.duration, packet.type);
	            trackData.chunkQueue.push(audioChunk);
	            await this.interleaveChunks();
	        }
	        finally {
	            release();
	        }
	    }
	    async addSubtitleCue(track, cue, meta) {
	        const release = await this.mutex.acquire();
	        try {
	            const trackData = this.getSubtitleTrackData(track, meta);
	            const timestamp = this.validateAndNormalizeTimestamp(trackData.track, cue.timestamp, true);
	            let bodyText = cue.text;
	            const timestampMs = Math.round(timestamp * 1000);
	            // Replace in-body timestamps so that they're relative to the cue start time
	            inlineTimestampRegex.lastIndex = 0;
	            bodyText = bodyText.replace(inlineTimestampRegex, (match) => {
	                const time = parseSubtitleTimestamp(match.slice(1, -1));
	                const offsetTime = time - timestampMs;
	                return `<${formatSubtitleTimestamp(offsetTime)}>`;
	            });
	            const body = textEncoder.encode(bodyText);
	            const additions = `${cue.settings ?? ''}\n${cue.identifier ?? ''}\n${cue.notes ?? ''}`;
	            const subtitleChunk = this.createInternalChunk(body, timestamp, cue.duration, 'key', additions.trim() ? textEncoder.encode(additions) : null);
	            trackData.chunkQueue.push(subtitleChunk);
	            await this.interleaveChunks();
	        }
	        finally {
	            release();
	        }
	    }
	    async interleaveChunks(isFinalCall = false) {
	        if (!isFinalCall && !this.allTracksAreKnown()) {
	            return; // We can't interleave yet as we don't yet know how many tracks we'll truly have
	        }
	        outer: while (true) {
	            let trackWithMinTimestamp = null;
	            let minTimestamp = Infinity;
	            for (const trackData of this.trackDatas) {
	                if (!isFinalCall && trackData.chunkQueue.length === 0 && !trackData.track.source._closed) {
	                    break outer;
	                }
	                if (trackData.chunkQueue.length > 0 && trackData.chunkQueue[0].timestamp < minTimestamp) {
	                    trackWithMinTimestamp = trackData;
	                    minTimestamp = trackData.chunkQueue[0].timestamp;
	                }
	            }
	            if (!trackWithMinTimestamp) {
	                break;
	            }
	            const chunk = trackWithMinTimestamp.chunkQueue.shift();
	            this.writeBlock(trackWithMinTimestamp, chunk);
	        }
	        if (!isFinalCall) {
	            await this.writer.flush();
	        }
	    }
	    /**
	     * Due to [a bug in Chromium](https://bugs.chromium.org/p/chromium/issues/detail?id=1377842), VP9 streams often
	     * lack color space information. This method patches in that information.
	     */
	    fixVP9ColorSpace(trackData, chunk) {
	        // http://downloads.webmproject.org/docs/vp9/vp9-bitstream_superframe-and-uncompressed-header_v1.0.pdf
	        if (chunk.type !== 'key')
	            return;
	        if (!trackData.info.decoderConfig.colorSpace || !trackData.info.decoderConfig.colorSpace.matrix)
	            return;
	        const bitstream = new Bitstream(chunk.data);
	        bitstream.skipBits(2);
	        const profileLowBit = bitstream.readBits(1);
	        const profileHighBit = bitstream.readBits(1);
	        const profile = (profileHighBit << 1) + profileLowBit;
	        if (profile === 3)
	            bitstream.skipBits(1);
	        const showExistingFrame = bitstream.readBits(1);
	        if (showExistingFrame)
	            return;
	        const frameType = bitstream.readBits(1);
	        if (frameType !== 0)
	            return; // Just to be sure
	        bitstream.skipBits(2);
	        const syncCode = bitstream.readBits(24);
	        if (syncCode !== 0x498342)
	            return;
	        if (profile >= 2)
	            bitstream.skipBits(1);
	        const colorSpaceID = {
	            rgb: 7,
	            bt709: 2,
	            bt470bg: 1,
	            smpte170m: 3,
	        }[trackData.info.decoderConfig.colorSpace.matrix];
	        // The bitstream position is now at the start of the color space bits.
	        // We can use the global writeBits function here as requested.
	        writeBits(chunk.data, bitstream.pos, bitstream.pos + 3, colorSpaceID);
	    }
	    /** Converts a read-only external chunk into an internal one for easier use. */
	    createInternalChunk(data, timestamp, duration, type, additions = null) {
	        const internalChunk = {
	            data,
	            type,
	            timestamp,
	            duration,
	            additions,
	        };
	        return internalChunk;
	    }
	    /** Writes a block containing media data to the file. */
	    writeBlock(trackData, chunk) {
	        // Due to the interlacing algorithm, this code will be run once we've seen one chunk from every media track.
	        if (!this.segment) {
	            this.createSegment();
	        }
	        const msTimestamp = Math.round(1000 * chunk.timestamp);
	        // We wanna only finalize this cluster (and begin a new one) if we know that each track will be able to
	        // start the new one with a key frame.
	        const keyFrameQueuedEverywhere = this.trackDatas.every((otherTrackData) => {
	            if (trackData === otherTrackData) {
	                return chunk.type === 'key';
	            }
	            const firstQueuedSample = otherTrackData.chunkQueue[0];
	            if (firstQueuedSample) {
	                return firstQueuedSample.type === 'key';
	            }
	            return otherTrackData.track.source._closed;
	        });
	        let shouldCreateNewCluster = false;
	        if (!this.currentCluster) {
	            shouldCreateNewCluster = true;
	        }
	        else {
	            assert(this.currentClusterStartMsTimestamp !== null);
	            assert(this.currentClusterMaxMsTimestamp !== null);
	            const relativeTimestamp = msTimestamp - this.currentClusterStartMsTimestamp;
	            shouldCreateNewCluster = (keyFrameQueuedEverywhere
	                // This check is required because that means there is already a block with this timestamp in the
	                // CURRENT chunk, meaning that starting the next cluster at the same timestamp is forbidden (since
	                // the already-written block would belong into it instead).
	                && msTimestamp > this.currentClusterMaxMsTimestamp
	                && relativeTimestamp >= 1000 * (this.format._options.minimumClusterDuration ?? 1))
	                // The cluster would exceed its maximum allowed length. This puts us in an unfortunate position and forces
	                // us to begin the next cluster with a delta frame. Although this is undesirable, it is not forbidden by the
	                // spec and is supported by players.
	                || relativeTimestamp > MAX_CLUSTER_TIMESTAMP_MS;
	        }
	        if (shouldCreateNewCluster) {
	            this.createNewCluster(msTimestamp);
	        }
	        const relativeTimestamp = msTimestamp - this.currentClusterStartMsTimestamp;
	        if (relativeTimestamp < MIN_CLUSTER_TIMESTAMP_MS) {
	            // The block lies too far in the past, it's not representable within this cluster
	            return;
	        }
	        const prelude = new Uint8Array(4);
	        const view = new DataView(prelude.buffer);
	        // 0x80 to indicate it's the last byte of a multi-byte number
	        view.setUint8(0, 0x80 | trackData.track.id);
	        view.setInt16(1, relativeTimestamp, false);
	        const msDuration = Math.round(1000 * chunk.duration);
	        if (!chunk.additions) {
	            // No additions, we can write out a SimpleBlock
	            view.setUint8(3, Number(chunk.type === 'key') << 7); // Flags (keyframe flag only present for SimpleBlock)
	            const simpleBlock = { id: EBMLId.SimpleBlock, data: [
	                    prelude,
	                    chunk.data,
	                ] };
	            this.ebmlWriter.writeEBML(simpleBlock);
	        }
	        else {
	            const blockGroup = { id: EBMLId.BlockGroup, data: [
	                    { id: EBMLId.Block, data: [
	                            prelude,
	                            chunk.data,
	                        ] },
	                    chunk.type === 'delta'
	                        ? {
	                            id: EBMLId.ReferenceBlock,
	                            data: new EBMLSignedInt(trackData.lastWrittenMsTimestamp - msTimestamp),
	                        }
	                        : null,
	                    chunk.additions
	                        ? { id: EBMLId.BlockAdditions, data: [
	                                { id: EBMLId.BlockMore, data: [
	                                        { id: EBMLId.BlockAddID, data: 1 }, // Some players expect BlockAddID to come first
	                                        { id: EBMLId.BlockAdditional, data: chunk.additions },
	                                    ] },
	                            ] }
	                        : null,
	                    msDuration > 0 ? { id: EBMLId.BlockDuration, data: msDuration } : null,
	                ] };
	            this.ebmlWriter.writeEBML(blockGroup);
	        }
	        this.duration = Math.max(this.duration, msTimestamp + msDuration);
	        trackData.lastWrittenMsTimestamp = msTimestamp;
	        if (!this.trackDatasInCurrentCluster.has(trackData)) {
	            this.trackDatasInCurrentCluster.set(trackData, {
	                firstMsTimestamp: msTimestamp,
	            });
	        }
	        this.currentClusterMaxMsTimestamp = Math.max(this.currentClusterMaxMsTimestamp, msTimestamp);
	    }
	    /** Creates a new Cluster element to contain media chunks. */
	    createNewCluster(msTimestamp) {
	        if (this.currentCluster) {
	            this.finalizeCurrentCluster();
	        }
	        if (this.format._options.onCluster) {
	            this.writer.startTrackingWrites();
	        }
	        this.currentCluster = {
	            id: EBMLId.Cluster,
	            size: this.format._options.appendOnly ? -1 : CLUSTER_SIZE_BYTES,
	            data: [
	                { id: EBMLId.Timestamp, data: msTimestamp },
	            ],
	        };
	        this.ebmlWriter.writeEBML(this.currentCluster);
	        this.currentClusterStartMsTimestamp = msTimestamp;
	        this.currentClusterMaxMsTimestamp = msTimestamp;
	        this.trackDatasInCurrentCluster.clear();
	    }
	    finalizeCurrentCluster() {
	        assert(this.currentCluster);
	        if (!this.format._options.appendOnly) {
	            const clusterSize = this.writer.getPos() - this.ebmlWriter.dataOffsets.get(this.currentCluster);
	            const endPos = this.writer.getPos();
	            // Write the size now that we know it
	            this.writer.seek(this.ebmlWriter.offsets.get(this.currentCluster) + 4);
	            this.ebmlWriter.writeVarInt(clusterSize, CLUSTER_SIZE_BYTES);
	            this.writer.seek(endPos);
	        }
	        if (this.format._options.onCluster) {
	            assert(this.currentClusterStartMsTimestamp !== null);
	            const { data, start } = this.writer.stopTrackingWrites();
	            this.format._options.onCluster(data, start, this.currentClusterStartMsTimestamp / 1000);
	        }
	        const clusterOffsetFromSegment = this.ebmlWriter.offsets.get(this.currentCluster) - this.segmentDataOffset;
	        // Group tracks by their first timestamp and create a CuePoint for each unique timestamp
	        const groupedByTimestamp = new Map();
	        for (const [trackData, { firstMsTimestamp }] of this.trackDatasInCurrentCluster) {
	            if (!groupedByTimestamp.has(firstMsTimestamp)) {
	                groupedByTimestamp.set(firstMsTimestamp, []);
	            }
	            groupedByTimestamp.get(firstMsTimestamp).push(trackData);
	        }
	        const groupedAndSortedByTimestamp = [...groupedByTimestamp.entries()].sort((a, b) => a[0] - b[0]);
	        // Add CuePoints to the Cues element for better seeking
	        for (const [msTimestamp, trackDatas] of groupedAndSortedByTimestamp) {
	            assert(this.cues);
	            this.cues.data.push({ id: EBMLId.CuePoint, data: [
	                    { id: EBMLId.CueTime, data: msTimestamp },
	                    // Create CueTrackPositions for each track that starts at this timestamp
	                    ...trackDatas.map((trackData) => {
	                        return { id: EBMLId.CueTrackPositions, data: [
	                                { id: EBMLId.CueTrack, data: trackData.track.id },
	                                { id: EBMLId.CueClusterPosition, data: clusterOffsetFromSegment },
	                            ] };
	                    }),
	                ] });
	        }
	    }
	    // eslint-disable-next-line @typescript-eslint/no-misused-promises
	    async onTrackClose() {
	        const release = await this.mutex.acquire();
	        if (this.allTracksAreKnown()) {
	            this.allTracksKnown.resolve();
	        }
	        // Since a track is now closed, we may be able to write out chunks that were previously waiting
	        await this.interleaveChunks();
	        release();
	    }
	    /** Finalizes the file, making it ready for use. Must be called after all media chunks have been added. */
	    async finalize() {
	        const release = await this.mutex.acquire();
	        this.allTracksKnown.resolve();
	        if (!this.segment) {
	            this.createSegment();
	        }
	        // Flush any remaining queued chunks to the file
	        await this.interleaveChunks(true);
	        if (this.currentCluster) {
	            this.finalizeCurrentCluster();
	        }
	        assert(this.cues);
	        this.ebmlWriter.writeEBML(this.cues);
	        if (!this.format._options.appendOnly) {
	            const endPos = this.writer.getPos();
	            // Write the Segment size
	            const segmentSize = this.writer.getPos() - this.segmentDataOffset;
	            this.writer.seek(this.ebmlWriter.offsets.get(this.segment) + 4);
	            this.ebmlWriter.writeVarInt(segmentSize, SEGMENT_SIZE_BYTES);
	            // Write the duration of the media to the Segment
	            this.segmentDuration.data = new EBMLFloat64(this.duration);
	            this.writer.seek(this.ebmlWriter.offsets.get(this.segmentDuration));
	            this.ebmlWriter.writeEBML(this.segmentDuration);
	            // Fill in SeekHead position data and write it again
	            assert(this.seekHead);
	            this.writer.seek(this.ebmlWriter.offsets.get(this.seekHead));
	            this.maybeCreateSeekHead(true);
	            this.ebmlWriter.writeEBML(this.seekHead);
	            this.writer.seek(endPos);
	        }
	        release();
	    }
	}

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	/**
	 * Base class representing an output media file format.
	 * @group Output formats
	 * @public
	 */
	class OutputFormat {
	    /** Returns a list of video codecs that this output format can contain. */
	    getSupportedVideoCodecs() {
	        return this.getSupportedCodecs()
	            .filter(codec => VIDEO_CODECS.includes(codec));
	    }
	    /** Returns a list of audio codecs that this output format can contain. */
	    getSupportedAudioCodecs() {
	        return this.getSupportedCodecs()
	            .filter(codec => AUDIO_CODECS.includes(codec));
	    }
	    /** Returns a list of subtitle codecs that this output format can contain. */
	    getSupportedSubtitleCodecs() {
	        return this.getSupportedCodecs()
	            .filter(codec => SUBTITLE_CODECS.includes(codec));
	    }
	    /** @internal */
	    // eslint-disable-next-line @typescript-eslint/no-unused-vars
	    _codecUnsupportedHint(codec) {
	        return '';
	    }
	}
	/**
	 * Format representing files compatible with the ISO base media file format (ISOBMFF), like MP4 or MOV files.
	 * @group Output formats
	 * @public
	 */
	class IsobmffOutputFormat extends OutputFormat {
	    /** Internal constructor. */
	    constructor(options = {}) {
	        if (!options || typeof options !== 'object') {
	            throw new TypeError('options must be an object.');
	        }
	        if (options.fastStart !== undefined
	            && ![false, 'in-memory', 'reserve', 'fragmented'].includes(options.fastStart)) {
	            throw new TypeError('options.fastStart, when provided, must be false, \'in-memory\', \'reserve\', or \'fragmented\'.');
	        }
	        if (options.minimumFragmentDuration !== undefined
	            && (!Number.isFinite(options.minimumFragmentDuration) || options.minimumFragmentDuration < 0)) {
	            throw new TypeError('options.minimumFragmentDuration, when provided, must be a non-negative number.');
	        }
	        if (options.onFtyp !== undefined && typeof options.onFtyp !== 'function') {
	            throw new TypeError('options.onFtyp, when provided, must be a function.');
	        }
	        if (options.onMoov !== undefined && typeof options.onMoov !== 'function') {
	            throw new TypeError('options.onMoov, when provided, must be a function.');
	        }
	        if (options.onMdat !== undefined && typeof options.onMdat !== 'function') {
	            throw new TypeError('options.onMdat, when provided, must be a function.');
	        }
	        if (options.onMoof !== undefined && typeof options.onMoof !== 'function') {
	            throw new TypeError('options.onMoof, when provided, must be a function.');
	        }
	        if (options.metadataFormat !== undefined
	            && !['mdir', 'mdta', 'udta', 'auto'].includes(options.metadataFormat)) {
	            throw new TypeError('options.metadataFormat, when provided, must be either \'auto\', \'mdir\', \'mdta\', or \'udta\'.');
	        }
	        super();
	        this._options = options;
	    }
	    getSupportedTrackCounts() {
	        return {
	            video: { min: 0, max: Infinity },
	            audio: { min: 0, max: Infinity },
	            subtitle: { min: 0, max: Infinity },
	            total: { min: 1, max: 2 ** 32 - 1 }, // Have fun reaching this one
	        };
	    }
	    get supportsVideoRotationMetadata() {
	        return true;
	    }
	    /** @internal */
	    _createMuxer(output) {
	        return new IsobmffMuxer(output, this);
	    }
	}
	/**
	 * MPEG-4 Part 14 (MP4) file format. Supports most codecs.
	 * @group Output formats
	 * @public
	 */
	class Mp4OutputFormat extends IsobmffOutputFormat {
	    /** Creates a new {@link Mp4OutputFormat} configured with the specified `options`. */
	    constructor(options) {
	        super(options);
	    }
	    /** @internal */
	    get _name() {
	        return 'MP4';
	    }
	    get fileExtension() {
	        return '.mp4';
	    }
	    get mimeType() {
	        return 'video/mp4';
	    }
	    getSupportedCodecs() {
	        return [
	            ...VIDEO_CODECS,
	            ...NON_PCM_AUDIO_CODECS,
	            // These are supported via ISO/IEC 23003-5
	            'pcm-s16',
	            'pcm-s16be',
	            'pcm-s24',
	            'pcm-s24be',
	            'pcm-s32',
	            'pcm-s32be',
	            'pcm-f32',
	            'pcm-f32be',
	            'pcm-f64',
	            'pcm-f64be',
	            ...SUBTITLE_CODECS,
	        ];
	    }
	    /** @internal */
	    _codecUnsupportedHint(codec) {
	        if (new MovOutputFormat().getSupportedCodecs().includes(codec)) {
	            return ' Switching to MOV will grant support for this codec.';
	        }
	        return '';
	    }
	}
	/**
	 * QuickTime File Format (QTFF), often called MOV. Supports all video and audio codecs, but not subtitle codecs.
	 * @group Output formats
	 * @public
	 */
	class MovOutputFormat extends IsobmffOutputFormat {
	    /** Creates a new {@link MovOutputFormat} configured with the specified `options`. */
	    constructor(options) {
	        super(options);
	    }
	    /** @internal */
	    get _name() {
	        return 'MOV';
	    }
	    get fileExtension() {
	        return '.mov';
	    }
	    get mimeType() {
	        return 'video/quicktime';
	    }
	    getSupportedCodecs() {
	        return [
	            ...VIDEO_CODECS,
	            ...AUDIO_CODECS,
	        ];
	    }
	    /** @internal */
	    _codecUnsupportedHint(codec) {
	        if (new Mp4OutputFormat().getSupportedCodecs().includes(codec)) {
	            return ' Switching to MP4 will grant support for this codec.';
	        }
	        return '';
	    }
	}
	/**
	 * Matroska file format.
	 *
	 * Supports writing transparent video. For a video track to be marked as transparent, the first packet added must
	 * contain alpha side data.
	 *
	 * @group Output formats
	 * @public
	 */
	class MkvOutputFormat extends OutputFormat {
	    /** Creates a new {@link MkvOutputFormat} configured with the specified `options`. */
	    constructor(options = {}) {
	        if (!options || typeof options !== 'object') {
	            throw new TypeError('options must be an object.');
	        }
	        if (options.appendOnly !== undefined && typeof options.appendOnly !== 'boolean') {
	            throw new TypeError('options.appendOnly, when provided, must be a boolean.');
	        }
	        if (options.minimumClusterDuration !== undefined
	            && (!Number.isFinite(options.minimumClusterDuration) || options.minimumClusterDuration < 0)) {
	            throw new TypeError('options.minimumClusterDuration, when provided, must be a non-negative number.');
	        }
	        if (options.onEbmlHeader !== undefined && typeof options.onEbmlHeader !== 'function') {
	            throw new TypeError('options.onEbmlHeader, when provided, must be a function.');
	        }
	        if (options.onSegmentHeader !== undefined && typeof options.onSegmentHeader !== 'function') {
	            throw new TypeError('options.onHeader, when provided, must be a function.');
	        }
	        if (options.onCluster !== undefined && typeof options.onCluster !== 'function') {
	            throw new TypeError('options.onCluster, when provided, must be a function.');
	        }
	        super();
	        this._options = options;
	    }
	    /** @internal */
	    _createMuxer(output) {
	        return new MatroskaMuxer(output, this);
	    }
	    /** @internal */
	    get _name() {
	        return 'Matroska';
	    }
	    getSupportedTrackCounts() {
	        return {
	            video: { min: 0, max: Infinity },
	            audio: { min: 0, max: Infinity },
	            subtitle: { min: 0, max: Infinity },
	            total: { min: 1, max: 127 },
	        };
	    }
	    get fileExtension() {
	        return '.mkv';
	    }
	    get mimeType() {
	        return 'video/x-matroska';
	    }
	    getSupportedCodecs() {
	        return [
	            ...VIDEO_CODECS,
	            ...NON_PCM_AUDIO_CODECS,
	            ...PCM_AUDIO_CODECS.filter(codec => !['pcm-s8', 'pcm-f32be', 'pcm-f64be', 'ulaw', 'alaw'].includes(codec)),
	            ...SUBTITLE_CODECS,
	        ];
	    }
	    get supportsVideoRotationMetadata() {
	        // While it technically does support it with ProjectionPoseRoll, many players appear to ignore this value
	        return false;
	    }
	}
	/**
	 * WebM file format, based on Matroska.
	 *
	 * Supports writing transparent video. For a video track to be marked as transparent, the first packet added must
	 * contain alpha side data.
	 *
	 * @group Output formats
	 * @public
	 */
	class WebMOutputFormat extends MkvOutputFormat {
	    /** Creates a new {@link WebMOutputFormat} configured with the specified `options`. */
	    constructor(options) {
	        super(options);
	    }
	    getSupportedCodecs() {
	        return [
	            ...VIDEO_CODECS.filter(codec => ['vp8', 'vp9', 'av1'].includes(codec)),
	            ...AUDIO_CODECS.filter(codec => ['opus', 'vorbis'].includes(codec)),
	            ...SUBTITLE_CODECS,
	        ];
	    }
	    /** @internal */
	    get _name() {
	        return 'WebM';
	    }
	    get fileExtension() {
	        return '.webm';
	    }
	    get mimeType() {
	        return 'video/webm';
	    }
	    /** @internal */
	    _codecUnsupportedHint(codec) {
	        if (new MkvOutputFormat().getSupportedCodecs().includes(codec)) {
	            return ' Switching to MKV will grant support for this codec.';
	        }
	        return '';
	    }
	}

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	/**
	 * Base class for media sources. Media sources are used to add media samples to an output file.
	 * @group Media sources
	 * @public
	 */
	class MediaSource {
	    constructor() {
	        /** @internal */
	        this._connectedTrack = null;
	        /** @internal */
	        this._closingPromise = null;
	        /** @internal */
	        this._closed = false;
	        /**
	         * @internal
	         * A time offset in seconds that is added to all timestamps generated by this source.
	         */
	        this._timestampOffset = 0;
	    }
	    /** @internal */
	    _ensureValidAdd() {
	        if (!this._connectedTrack) {
	            throw new Error('Source is not connected to an output track.');
	        }
	        if (this._connectedTrack.output.state === 'canceled') {
	            throw new Error('Output has been canceled.');
	        }
	        if (this._connectedTrack.output.state === 'finalizing' || this._connectedTrack.output.state === 'finalized') {
	            throw new Error('Output has been finalized.');
	        }
	        if (this._connectedTrack.output.state === 'pending') {
	            throw new Error('Output has not started.');
	        }
	        if (this._closed) {
	            throw new Error('Source is closed.');
	        }
	    }
	    /** @internal */
	    async _start() { }
	    /** @internal */
	    // eslint-disable-next-line @typescript-eslint/no-unused-vars
	    async _flushAndClose(forceClose) { }
	    /**
	     * Closes this source. This prevents future samples from being added and signals to the output file that no further
	     * samples will come in for this track. Calling `.close()` is optional but recommended after adding the
	     * last sample - for improved performance and reduced memory usage.
	     */
	    close() {
	        if (this._closingPromise) {
	            return;
	        }
	        const connectedTrack = this._connectedTrack;
	        if (!connectedTrack) {
	            throw new Error('Cannot call close without connecting the source to an output track.');
	        }
	        if (connectedTrack.output.state === 'pending') {
	            throw new Error('Cannot call close before output has been started.');
	        }
	        this._closingPromise = (async () => {
	            await this._flushAndClose(false);
	            this._closed = true;
	            if (connectedTrack.output.state === 'finalizing' || connectedTrack.output.state === 'finalized') {
	                return;
	            }
	            connectedTrack.output._muxer.onTrackClose(connectedTrack);
	        })();
	    }
	    /** @internal */
	    async _flushOrWaitForOngoingClose(forceClose) {
	        if (this._closingPromise) {
	            // Since closing also flushes, we don't want to do it twice
	            return this._closingPromise;
	        }
	        else {
	            return this._flushAndClose(forceClose);
	        }
	    }
	}
	/**
	 * Base class for video sources - sources for video tracks.
	 * @group Media sources
	 * @public
	 */
	class VideoSource extends MediaSource {
	    /** Internal constructor. */
	    constructor(codec) {
	        super();
	        /** @internal */
	        this._connectedTrack = null;
	        if (!VIDEO_CODECS.includes(codec)) {
	            throw new TypeError(`Invalid video codec '${codec}'. Must be one of: ${VIDEO_CODECS.join(', ')}.`);
	        }
	        this._codec = codec;
	    }
	}
	/**
	 * The most basic video source; can be used to directly pipe encoded packets into the output file.
	 * @group Media sources
	 * @public
	 */
	class EncodedVideoPacketSource extends VideoSource {
	    /** Creates a new {@link EncodedVideoPacketSource} whose packets are encoded using `codec`. */
	    constructor(codec) {
	        super(codec);
	    }
	    /**
	     * Adds an encoded packet to the output video track. Packets must be added in *decode order*, while a packet's
	     * timestamp must be its *presentation timestamp*. B-frames are handled automatically.
	     *
	     * @param meta - Additional metadata from the encoder. You should pass this for the first call, including a valid
	     * decoder config.
	     *
	     * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
	     * to respect writer and encoder backpressure.
	     */
	    add(packet, meta) {
	        if (!(packet instanceof EncodedPacket)) {
	            throw new TypeError('packet must be an EncodedPacket.');
	        }
	        if (packet.isMetadataOnly) {
	            throw new TypeError('Metadata-only packets cannot be added.');
	        }
	        if (meta !== undefined && (!meta || typeof meta !== 'object')) {
	            throw new TypeError('meta, when provided, must be an object.');
	        }
	        this._ensureValidAdd();
	        return this._connectedTrack.output._muxer.addEncodedVideoPacket(this._connectedTrack, packet, meta);
	    }
	}
	/**
	 * Base class for audio sources - sources for audio tracks.
	 * @group Media sources
	 * @public
	 */
	class AudioSource extends MediaSource {
	    /** Internal constructor. */
	    constructor(codec) {
	        super();
	        /** @internal */
	        this._connectedTrack = null;
	        if (!AUDIO_CODECS.includes(codec)) {
	            throw new TypeError(`Invalid audio codec '${codec}'. Must be one of: ${AUDIO_CODECS.join(', ')}.`);
	        }
	        this._codec = codec;
	    }
	}
	/**
	 * Base class for subtitle sources - sources for subtitle tracks.
	 * @group Media sources
	 * @public
	 */
	class SubtitleSource extends MediaSource {
	    /** Internal constructor. */
	    constructor(codec) {
	        super();
	        /** @internal */
	        this._connectedTrack = null;
	        if (!SUBTITLE_CODECS.includes(codec)) {
	            throw new TypeError(`Invalid subtitle codec '${codec}'. Must be one of: ${SUBTITLE_CODECS.join(', ')}.`);
	        }
	        this._codec = codec;
	    }
	}

	/*!
	 * Copyright (c) 2025-present, Vanilagy and contributors
	 *
	 * This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
	 */
	/**
	 * List of all track types.
	 * @group Miscellaneous
	 * @public
	 */
	const ALL_TRACK_TYPES = ['video', 'audio', 'subtitle'];
	const validateBaseTrackMetadata = (metadata) => {
	    if (!metadata || typeof metadata !== 'object') {
	        throw new TypeError('metadata must be an object.');
	    }
	    if (metadata.languageCode !== undefined && !isIso639Dash2LanguageCode(metadata.languageCode)) {
	        throw new TypeError('metadata.languageCode, when provided, must be a three-letter, ISO 639-2/T language code.');
	    }
	    if (metadata.name !== undefined && typeof metadata.name !== 'string') {
	        throw new TypeError('metadata.name, when provided, must be a string.');
	    }
	    if (metadata.maximumPacketCount !== undefined
	        && (!Number.isInteger(metadata.maximumPacketCount) || metadata.maximumPacketCount < 0)) {
	        throw new TypeError('metadata.maximumPacketCount, when provided, must be a non-negative integer.');
	    }
	};
	/**
	 * Main class orchestrating the creation of a new media file.
	 * @group Output files
	 * @public
	 */
	class Output {
	    /**
	     * Creates a new instance of {@link Output} which can then be used to create a new media file according to the
	     * specified {@link OutputOptions}.
	     */
	    constructor(options) {
	        /** The current state of the output. */
	        this.state = 'pending';
	        /** @internal */
	        this._tracks = [];
	        /** @internal */
	        this._startPromise = null;
	        /** @internal */
	        this._cancelPromise = null;
	        /** @internal */
	        this._finalizePromise = null;
	        /** @internal */
	        this._mutex = new AsyncMutex();
	        /** @internal */
	        this._metadataTags = {};
	        if (!options || typeof options !== 'object') {
	            throw new TypeError('options must be an object.');
	        }
	        if (!(options.format instanceof OutputFormat)) {
	            throw new TypeError('options.format must be an OutputFormat.');
	        }
	        if (!(options.target instanceof Target)) {
	            throw new TypeError('options.target must be a Target.');
	        }
	        if (options.target._output) {
	            throw new Error('Target is already used for another output.');
	        }
	        options.target._output = this;
	        this.format = options.format;
	        this.target = options.target;
	        this._writer = options.target._createWriter();
	        this._muxer = options.format._createMuxer(this);
	    }
	    /** Adds a video track to the output with the given source. Can only be called before the output is started. */
	    addVideoTrack(source, metadata = {}) {
	        if (!(source instanceof VideoSource)) {
	            throw new TypeError('source must be a VideoSource.');
	        }
	        validateBaseTrackMetadata(metadata);
	        if (metadata.rotation !== undefined && ![0, 90, 180, 270].includes(metadata.rotation)) {
	            throw new TypeError(`Invalid video rotation: ${metadata.rotation}. Has to be 0, 90, 180 or 270.`);
	        }
	        if (!this.format.supportsVideoRotationMetadata && metadata.rotation) {
	            throw new Error(`${this.format._name} does not support video rotation metadata.`);
	        }
	        if (metadata.frameRate !== undefined
	            && (!Number.isFinite(metadata.frameRate) || metadata.frameRate <= 0)) {
	            throw new TypeError(`Invalid video frame rate: ${metadata.frameRate}. Must be a positive number.`);
	        }
	        this._addTrack('video', source, metadata);
	    }
	    /** Adds an audio track to the output with the given source. Can only be called before the output is started. */
	    addAudioTrack(source, metadata = {}) {
	        if (!(source instanceof AudioSource)) {
	            throw new TypeError('source must be an AudioSource.');
	        }
	        validateBaseTrackMetadata(metadata);
	        this._addTrack('audio', source, metadata);
	    }
	    /** Adds a subtitle track to the output with the given source. Can only be called before the output is started. */
	    addSubtitleTrack(source, metadata = {}) {
	        if (!(source instanceof SubtitleSource)) {
	            throw new TypeError('source must be a SubtitleSource.');
	        }
	        validateBaseTrackMetadata(metadata);
	        this._addTrack('subtitle', source, metadata);
	    }
	    /**
	     * Sets descriptive metadata tags about the media file, such as title, author, date, or cover art. When called
	     * multiple times, only the metadata from the last call will be used.
	     *
	     * Can only be called before the output is started.
	     */
	    setMetadataTags(tags) {
	        validateMetadataTags(tags);
	        if (this.state !== 'pending') {
	            throw new Error('Cannot set metadata tags after output has been started or canceled.');
	        }
	        this._metadataTags = tags;
	    }
	    /** @internal */
	    _addTrack(type, source, metadata) {
	        if (this.state !== 'pending') {
	            throw new Error('Cannot add track after output has been started or canceled.');
	        }
	        if (source._connectedTrack) {
	            throw new Error('Source is already used for a track.');
	        }
	        // Verify maximum track count constraints
	        const supportedTrackCounts = this.format.getSupportedTrackCounts();
	        const presentTracksOfThisType = this._tracks.reduce((count, track) => count + (track.type === type ? 1 : 0), 0);
	        const maxCount = supportedTrackCounts[type].max;
	        if (presentTracksOfThisType === maxCount) {
	            throw new Error(maxCount === 0
	                ? `${this.format._name} does not support ${type} tracks.`
	                : (`${this.format._name} does not support more than ${maxCount} ${type} track`
	                    + `${maxCount === 1 ? '' : 's'}.`));
	        }
	        const maxTotalCount = supportedTrackCounts.total.max;
	        if (this._tracks.length === maxTotalCount) {
	            throw new Error(`${this.format._name} does not support more than ${maxTotalCount} tracks`
	                + `${maxTotalCount === 1 ? '' : 's'} in total.`);
	        }
	        const track = {
	            id: this._tracks.length + 1,
	            output: this,
	            type,
	            source: source,
	            metadata,
	        };
	        if (track.type === 'video') {
	            const supportedVideoCodecs = this.format.getSupportedVideoCodecs();
	            if (supportedVideoCodecs.length === 0) {
	                throw new Error(`${this.format._name} does not support video tracks.`
	                    + this.format._codecUnsupportedHint(track.source._codec));
	            }
	            else if (!supportedVideoCodecs.includes(track.source._codec)) {
	                throw new Error(`Codec '${track.source._codec}' cannot be contained within ${this.format._name}. Supported`
	                    + ` video codecs are: ${supportedVideoCodecs.map(codec => `'${codec}'`).join(', ')}.`
	                    + this.format._codecUnsupportedHint(track.source._codec));
	            }
	        }
	        else if (track.type === 'audio') {
	            const supportedAudioCodecs = this.format.getSupportedAudioCodecs();
	            if (supportedAudioCodecs.length === 0) {
	                throw new Error(`${this.format._name} does not support audio tracks.`
	                    + this.format._codecUnsupportedHint(track.source._codec));
	            }
	            else if (!supportedAudioCodecs.includes(track.source._codec)) {
	                throw new Error(`Codec '${track.source._codec}' cannot be contained within ${this.format._name}. Supported`
	                    + ` audio codecs are: ${supportedAudioCodecs.map(codec => `'${codec}'`).join(', ')}.`
	                    + this.format._codecUnsupportedHint(track.source._codec));
	            }
	        }
	        else if (track.type === 'subtitle') {
	            const supportedSubtitleCodecs = this.format.getSupportedSubtitleCodecs();
	            if (supportedSubtitleCodecs.length === 0) {
	                throw new Error(`${this.format._name} does not support subtitle tracks.`
	                    + this.format._codecUnsupportedHint(track.source._codec));
	            }
	            else if (!supportedSubtitleCodecs.includes(track.source._codec)) {
	                throw new Error(`Codec '${track.source._codec}' cannot be contained within ${this.format._name}. Supported`
	                    + ` subtitle codecs are: ${supportedSubtitleCodecs.map(codec => `'${codec}'`).join(', ')}.`
	                    + this.format._codecUnsupportedHint(track.source._codec));
	            }
	        }
	        this._tracks.push(track);
	        source._connectedTrack = track;
	    }
	    /**
	     * Starts the creation of the output file. This method should be called after all tracks have been added. Only after
	     * the output has started can media samples be added to the tracks.
	     *
	     * @returns A promise that resolves when the output has successfully started and is ready to receive media samples.
	     */
	    async start() {
	        // Verify minimum track count constraints
	        const supportedTrackCounts = this.format.getSupportedTrackCounts();
	        for (const trackType of ALL_TRACK_TYPES) {
	            const presentTracksOfThisType = this._tracks.reduce((count, track) => count + (track.type === trackType ? 1 : 0), 0);
	            const minCount = supportedTrackCounts[trackType].min;
	            if (presentTracksOfThisType < minCount) {
	                throw new Error(minCount === supportedTrackCounts[trackType].max
	                    ? (`${this.format._name} requires exactly ${minCount} ${trackType}`
	                        + ` track${minCount === 1 ? '' : 's'}.`)
	                    : (`${this.format._name} requires at least ${minCount} ${trackType}`
	                        + ` track${minCount === 1 ? '' : 's'}.`));
	            }
	        }
	        const totalMinCount = supportedTrackCounts.total.min;
	        if (this._tracks.length < totalMinCount) {
	            throw new Error(totalMinCount === supportedTrackCounts.total.max
	                ? (`${this.format._name} requires exactly ${totalMinCount} track`
	                    + `${totalMinCount === 1 ? '' : 's'}.`)
	                : (`${this.format._name} requires at least ${totalMinCount} track`
	                    + `${totalMinCount === 1 ? '' : 's'}.`));
	        }
	        if (this.state === 'canceled') {
	            throw new Error('Output has been canceled.');
	        }
	        if (this._startPromise) {
	            console.warn('Output has already been started.');
	            return this._startPromise;
	        }
	        return this._startPromise = (async () => {
	            this.state = 'started';
	            this._writer.start();
	            const release = await this._mutex.acquire();
	            await this._muxer.start();
	            const promises = this._tracks.map(track => track.source._start());
	            await Promise.all(promises);
	            release();
	        })();
	    }
	    /**
	     * Resolves with the full MIME type of the output file, including track codecs.
	     *
	     * The returned promise will resolve only once the precise codec strings of all tracks are known.
	     */
	    getMimeType() {
	        return this._muxer.getMimeType();
	    }
	    /**
	     * Cancels the creation of the output file, releasing internal resources like encoders and preventing further
	     * samples from being added.
	     *
	     * @returns A promise that resolves once all internal resources have been released.
	     */
	    async cancel() {
	        if (this._cancelPromise) {
	            console.warn('Output has already been canceled.');
	            return this._cancelPromise;
	        }
	        else if (this.state === 'finalizing' || this.state === 'finalized') {
	            console.warn('Output has already been finalized.');
	            return;
	        }
	        return this._cancelPromise = (async () => {
	            this.state = 'canceled';
	            const release = await this._mutex.acquire();
	            const promises = this._tracks.map(x => x.source._flushOrWaitForOngoingClose(true)); // Force close
	            await Promise.all(promises);
	            await this._writer.close();
	            release();
	        })();
	    }
	    /**
	     * Finalizes the output file. This method must be called after all media samples across all tracks have been added.
	     * Once the Promise returned by this method completes, the output file is ready.
	     */
	    async finalize() {
	        if (this.state === 'pending') {
	            throw new Error('Cannot finalize before starting.');
	        }
	        if (this.state === 'canceled') {
	            throw new Error('Cannot finalize after canceling.');
	        }
	        if (this._finalizePromise) {
	            console.warn('Output has already been finalized.');
	            return this._finalizePromise;
	        }
	        return this._finalizePromise = (async () => {
	            this.state = 'finalizing';
	            const release = await this._mutex.acquire();
	            const promises = this._tracks.map(x => x.source._flushOrWaitForOngoingClose(false));
	            await Promise.all(promises);
	            await this._muxer.finalize();
	            await this._writer.flush();
	            await this._writer.finalize();
	            this.state = 'finalized';
	            release();
	        })();
	    }
	}

	/** @module vp */

	/**
	 * List of codecs
	 * @constant
	 * @type {import("../types.js").CodecItem[]}
	 */
	const VP_CODECS = [
	  { name: "VP8", cccc: "vp08" },
	  { name: "VP9", cccc: "vp09" },
	  // { name: "VP10", cccc: "vp10" },
	];

	/**
	 * List of VP profiles numbers
	 * @constant {number[]}
	 */
	const VP_PROFILES = [0, 1, 2, 3];

	/**
	 * VP Levels
	 * @constant
	 * @type {string[]}
	 * @see [webmproject.org]{@link https://www.webmproject.org/vp9/mp4/}
	 */
	// prettier-ignore
	const VP_LEVELS = [
	  "1", "1.1",
	  "2", "2.1",
	  "3", "3.1",
	  "4", "4.1",
	  "5", "5.1", "5.2",
	  "6", "6.1", "6.2"
	];

	/**
	 * List of supported bit depth
	 * @constant
	 * @type {number[]}
	 */
	const VP_BIT_DEPTH = [8, 10, 12];

	/** @private  */
	const formatProfile = (profile) => String(profile).padStart(2, "0");

	/** @private  */
	const formatLevel$1 = (level) => String(parseFloat(level) * 10).padStart(2, "0");

	/** @private  */
	const formatBitDepth = (bitDepth) => String(bitDepth).padStart(2, "0");

	/** @private  */
	const formatCodec$1 = (cccc, PP, LL, DD) => `${cccc}.${PP}.${LL}.${DD}`;

	/**
	 * Get a codec parameter string
	 * @param {import("../types.js").VPCodecOptions} options
	 * @returns {string}
	 */
	const getCodec$1 = ({ name, profile, level, bitDepth }) => {
	  const codec = VP_CODECS.find((codec) => codec.name === name);
	  if (!codec) throw new Error(`Unknown VP Codec "${name}"`);

	  if (!VP_PROFILES.includes(profile)) {
	    throw new Error(`Unknown VP Profile "${profile}"`);
	  }
	  if (!VP_LEVELS.includes(level)) {
	    throw new Error(`Unknown VP Level "${level}"`);
	  }
	  if (!VP_BIT_DEPTH.includes(bitDepth)) {
	    throw new Error(`Unknown VP BitDepth "${bitDepth}"`);
	  }

	  return formatCodec$1(
	    codec.cccc,
	    formatProfile(profile),
	    formatLevel$1(level),
	    formatBitDepth(bitDepth),
	  );
	};

	/** @module avc */

	/**
	 * List of profiles with their profile numbers (PP) and the constraints component (CC).
	 * @constant
	 * @type {import("../types.js").VCProfileItem[]}
	 */
	const AVC_PROFILES = [
	  { name: "Constrained Baseline", PP: "42", CC: "40" },
	  { name: "Baseline", PP: "42", CC: "00" },
	  { name: "Extended", PP: "58", CC: "00" },
	  { name: "Main", PP: "4d", CC: "00" },

	  { name: "High", PP: "64", CC: "00" },
	  { name: "Progressive High", PP: "64", CC: "08" },
	  { name: "Constrained High", PP: "64", CC: "0c" },
	  { name: "High 10", PP: "6e", CC: "00" },
	  { name: "High 4:2:2", PP: "7a", CC: "00" },
	  { name: "High 4:4:4 Predictive", PP: "f4", CC: "00" },
	  { name: "High 10 Intra", PP: "6e", CC: "10" },
	  { name: "High 4:2:2 Intra", PP: "7a", CC: "10" },
	  { name: "High 4:4:4 Intra", PP: "f4", CC: "10" },
	  { name: "CAVLC 4:4:4 Intra", PP: "44", CC: "00" },

	  { name: "Scalable Baseline", PP: "53", CC: "00" },
	  { name: "Scalable Constrained Baseline", PP: "53", CC: "04" },
	  { name: "Scalable High", PP: "56", CC: "00" },
	  { name: "Scalable Constrained High", PP: "56", CC: "04" },
	  { name: "Scalable High Intra", PP: "56", CC: "20" },

	  { name: "Stereo High", PP: "80", CC: "00" },
	  { name: "Multiview High", PP: "76", CC: "00" },
	  { name: "Multiview Depth High", PP: "8a", CC: "00" },
	];
	const cccc = "avc1";

	/**
	 * AVC Levels
	 * @constant
	 * @type {number[]}
	 * @see [wikipedia.org]{@link https://en.wikipedia.org/wiki/Advanced_Video_Coding#Levels}
	 */
	// prettier-ignore
	const AVC_LEVELS = [
	  "1", "1.1", "1.2", "1.3",
	  "2", "2.1", "2.2",
	  "3", "3.1", "3.2",
	  "4", "4.1", "4.2",
	  "5", "5.1", "5.2",
	  "6", "6.1", "6.2"
	];

	/** @private */
	const formatLevel = (level) =>
	  (parseFloat(level) * 10).toString(16).padStart(2, "0");

	/** @private */
	const formatCodec = (cccc, { PP, CC }, LL) => `${cccc}.${PP}${CC}${LL}`;

	/**
	 * Get a codec parameter string
	 * @param {import("../types.js").AVCCodecOptions} options
	 * @returns {string}
	 */
	const getCodec = ({ profile: profileName, level }) => {
	  if (!AVC_LEVELS.includes(level))
	    throw new Error(`Unknown AVC Level "${level}"`);

	  const profile = AVC_PROFILES.find((profile) => profile.name === profileName);
	  if (!profile) throw new Error(`Unknown AVC Profile "${profileName}"`);

	  return formatCodec(cccc, profile, formatLevel(level));
	};

	/**
	 * @typedef {"mp4" | "webm" | "png" | "jpg" | "gif" | "mkv" | "mov"} EncoderExtensions
	 */

	/**
	 * @typedef {"in-browser" | "file-system"} EncoderTarget
	 */

	class Encoder {
	  /**
	   * The extension the encoder supports
	   * @type {Extensions[]}
	   */
	  static supportedExtensions = ["mp4", "webm"];
	  /**
	   * The target to download the file to.
	   * @type {EncoderTarget[]}
	   */
	  static supportedTargets = ["in-browser"];

	  static defaultOptions = {
	    frameMethod: "blob",
	    extension: Encoder.supportedExtensions[0],
	    target: Encoder.supportedTargets[0],
	  };

	  /**
	   * Base Encoder class. All Encoders extend it and its methods are called by the Recorder.
	   * @class Encoder
	   * @param {object} options
	   *
	   * @property {EncoderTarget} target
	   * @property {EncoderExtensions} extension
	   * @property {object} [encoderOptions]
	   * @property {object} [muxerOptions]
	   */
	  constructor(options) {
	    Object.assign(this, options);
	  }

	  /**
	   * Setup the encoder: load binary, instantiate muxers, setup file system target...
	   * @param {object} options
	   */
	  async init(options) {
	    Object.assign(this, options);
	  }

	  // File System API
	  async getDirectory() {
	    if (!("showDirectoryPicker" in window)) return;
	    return await window.showDirectoryPicker();
	  }

	  async getDirectoryHandle(directory, name) {
	    return await directory.getDirectoryHandle(name, { create: true });
	  }

	  async getFileHandle(name, options) {
	    if (this.directoryHandle) {
	      return await this.directoryHandle.getFileHandle(name, { create: true });
	    }

	    if (!("showSaveFilePicker" in window)) return;

	    return await window.showSaveFilePicker({
	      suggestedName: name,
	      ...options,
	    });
	  }

	  async getWritableFileStream(fileHandle) {
	    if (
	      (await fileHandle.queryPermission({ mode: "readwrite" })) === "granted"
	    ) {
	      return await fileHandle.createWritable();
	    }
	  }

	  // Override methods
	  /**
	   * Encode a single frame. The frameNumber is usually used for GOP (Group Of Pictures).
	   * @param {number} frame
	   * @param {number} [frameNumber]
	   */
	  async encode() {}

	  /**
	   * Stop the encoding process and cleanup the temporary data.
	   * @returns {(ArrayBuffer|Uint8Array|Blob[]|undefined)}
	   */
	  async stop() {}

	  /**
	   * Clean up the encoder
	   */
	  dispose() {}
	}

	/** @module createCanvasContext */

	const contextTypeList = [
	  "2d",
	  "webgl",
	  "experimental-webgl",
	  "webgl2",
	  "webgl2-compute",
	  "bitmaprenderer",
	  "gpupresent",
	  "webgpu",
	];

	/**
	 * Create a RenderingContext (2d, webgl, webgl2, bitmaprenderer, webgpu), optionally offscreen for possible use in a Worker.
	 *
	 * @alias module:createCanvasContext
	 * @param {import("./types.js").ContextType} [contextType="2d"]
	 * @param {import("./types.js").CanvasContextOptions} [options={}]
	 * @returns {import("./types.js").CanvasContextReturnValue}
	 */
	function createCanvasContext(contextType = "2d", options = {}) {
	  // Get options and set defaults
	  const {
	    width,
	    height,
	    offscreen = false,
	    worker = false,
	    contextAttributes = {},
	  } = {
	    ...options,
	  };

	  // Check contextType is valid
	  if (!worker && !contextTypeList.includes(contextType)) {
	    throw new TypeError(`Unknown contextType: "${contextType}"`);
	  }

	  // Return in Node or in a Worker unless a canvas is provided
	  // See https://github.com/Automattic/node-canvas for an example
	  if (typeof window === "undefined" && !options.canvas) {
	    return null;
	  }

	  // Get offscreen canvas if requested and available
	  const canvasEl = options.canvas || document.createElement("canvas");
	  const canvas =
	    (offscreen || worker) && "OffscreenCanvas" in window
	      ? canvasEl.transferControlToOffscreen()
	      : canvasEl;

	  // Set canvas dimensions (default to 300 in browsers)
	  if (Number.isInteger(width) && width >= 0) canvas.width = width;
	  if (Number.isInteger(height) && height >= 0) canvas.height = height;

	  if (worker) return { canvas };

	  // Get the context with specified attributes and handle experimental-webgl
	  let context;
	  try {
	    context =
	      canvas.getContext(contextType, contextAttributes) ||
	      (contextType === "webgl"
	        ? canvas.getContext("experimental-webgl", contextAttributes)
	        : null);
	  } catch (error) {
	    console.error(error);
	    context = null;
	  }

	  return {
	    canvas,
	    context,
	  };
	}

	/**
	 * Check for WebCodecs support on the current platform.
	 * @type {boolean}
	 */
	const isWebCodecsSupported =
	  typeof window !== "undefined" && typeof window.VideoEncoder === "function";

	let link;

	const downloadBlob = (filename, blobPart, mimeType) => {
	  link ||= document.createElement("a");
	  link.download = filename;

	  const blob = new Blob(blobPart, { type: mimeType });
	  const url = URL.createObjectURL(blob);
	  link.href = url;

	  const event = new MouseEvent("click");
	  link.dispatchEvent(event);

	  setTimeout(() => {
	    URL.revokeObjectURL(url);
	  }, 1);
	};

	let captureContext;
	const captureCanvasRegion = (canvas, x, y, width, height) => {
	  captureContext ||= createCanvasContext("2d", {
	    contextAttributes: { willReadFrequently: true },
	  }).context;
	  captureContext.canvas.width = width;
	  captureContext.canvas.height = height;

	  captureContext.drawImage(canvas, x, y, width, height, 0, 0, width, height);
	  return captureContext.canvas;
	};

	const formatDate = (date) =>
	  date.toISOString().replace(/:/g, "-").replace("T", "@").replace("Z", "");

	const formatSeconds = (seconds) => {
	  const minutes = Math.floor(seconds / 60);
	  const remainingSeconds = Math.floor(seconds - minutes * 60);
	  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
	};

	const nextMultiple = (x, n = 2) => Math.ceil(x / n) * n;

	class Deferred {
	  constructor() {
	    this.resolve = null;
	    this.reject = null;
	    this.promise = new Promise((resolve, reject) => {
	      this.resolve = resolve;
	      this.reject = reject;
	    });
	    Object.freeze(this);
	  }
	}

	/**
	 * Estimate the bit rate of a video rounded to nearest megabit.
	 * Based on "H.264 for the rest of us" by Kush Amerasinghe.
	 *
	 * @example
	 * ```js
	 * // Full HD (1080p)
	 * const bitRate = estimateBitRate(1920, 1080, 30, "variable");
	 * const bitRateMbps = bitRate * 1_000_000; // => 13 Mbps
	 * ```
	 *
	 * @param {number} width
	 * @param {number} height
	 * @param {number} frameRate
	 * @param {number} motionRank A factor of 1, 2 or 4
	 * @param {"variable" | "constant"} bitrateMode
	 * @returns {number} A bitrate value in bits per second
	 */
	const estimateBitRate = (
	  width,
	  height,
	  frameRate = 30,
	  motionRank = 4,
	  bitrateMode = "variable",
	) => {
	  const bitrate =
	    width *
	    height *
	    frameRate *
	    motionRank *
	    0.07 *
	    (bitrateMode === "variable" ? 0.75 : 1);
	  const roundingFactor = bitrate < 1_000_000 ? 1000 : 1_000_000;
	  return Math.round(bitrate / roundingFactor) * roundingFactor;
	};

	const extensionToOutputFormat = {
	  mp4: Mp4OutputFormat,
	  mov: MovOutputFormat,
	  webm: WebMOutputFormat,
	  mkv: MkvOutputFormat,
	};

	/**
	 * @typedef {object} WebCodecsEncoderOptions
	 * @property {number} [groupOfPictures=20]
	 * @property {number} [flushFrequency=10]
	 * @property {WebCodecsEncoderEncoderOptions} [encoderOptions={}]
	 */
	/**
	 * @typedef {VideoEncoderConfig} WebCodecsEncoderEncoderOptions
	 * @see [VideoEncoder.configure]{@link https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/configure#config}
	 */
	/**
	 * @typedef {import("mediabunny").OutputOptions} WebCodecsMuxerOptions
	 * @see [mediabunny#output-formats]{@link https://mediabunny.dev/guide/output-formats}
	 */

	class WebCodecsEncoder extends Encoder {
	  static supportedExtensions = ["mp4", "mov", "webm", "mkv"];
	  static supportedTargets = ["in-browser", "file-system"];

	  static defaultOptions = {
	    extension: WebCodecsEncoder.supportedExtensions[0],
	    groupOfPictures: 20,
	    flushFrequency: 10,
	  };

	  get frameMethod() {
	    return "videoFrame";
	  }

	  /**
	   * @param {WebCodecsEncoderOptions} [options]
	   */
	  constructor(options) {
	    super({ ...WebCodecsEncoder.defaultOptions, ...options });
	  }

	  async init(options) {
	    super.init(options);

	    if (this.target === "file-system") {
	      const fileHandle = await this.getFileHandle(this.filename, {
	        types: [
	          {
	            description: "Video File",
	            accept: { [this.mimeType.split(";")[0]]: [`.${this.extension}`] },
	          },
	        ],
	      });

	      this.writableFileStream = await this.getWritableFileStream(fileHandle);
	    }

	    const format = new extensionToOutputFormat[this.extension]({
	      fastStart: this.writableFileStream ? false : "in-memory",
	    });

	    // TODO: use format.getSupportedVideoCodecs();
	    const codec =
	      this.encoderOptions?.codec ||
	      (["mp4", "mov"].includes(this.extension)
	        ? getCodec({ profile: "High", level: "5.2" }) // avc1.640034
	        : getCodec$1({ name: "VP9", profile: 0, level: "1", bitDepth: 8 })); // vp09.00.10.08

	    const [CCCC] = codec.split(".");

	    this.muxer = new Output({
	      format,
	      target: this.writableFileStream
	        ? new StreamTarget(this.writableFileStream)
	        : new BufferTarget(),
	      ...this.muxerOptions,
	    });

	    let videoCodec; // Supported: "avc" | "hevc" | "av1" | "vp8" | "vp9" | "av1"
	    // https://www.w3.org/TR/webcodecs-hevc-codec-registration/#fully-qualified-codec-strings
	    if (CCCC.startsWith("hev") || CCCC.startsWith("hvc")) {
	      videoCodec = "hevc";
	    } else if (CCCC.startsWith("avc1")) {
	      videoCodec = "avc";
	    } else if (CCCC.startsWith("av01")) {
	      videoCodec = "av1";
	    } else if (CCCC.startsWith("vp")) {
	      videoCodec = VP_CODECS.find(
	        (codec) => codec.cccc === CCCC,
	      ).name.toLowerCase();
	    }

	    const videoSource = new EncodedVideoPacketSource(videoCodec);
	    this.muxer.addVideoTrack(videoSource, { frameRate: this.frameRate });

	    this.encoder = new VideoEncoder({
	      output: async (chunk, meta) => {
	        await videoSource.add(EncodedPacket.fromEncodedChunk(chunk), meta);
	      },
	      error: (e) => console.error(e),
	    });

	    const config = {
	      width: this.width,
	      height: this.height,
	      framerate: this.frameRate,
	      bitrate: estimateBitRate(
	        this.width,
	        this.height,
	        this.frameRate,
	        this.encoderOptions.bitrateMode,
	      ),
	      // bitrate: 1e6,
	      // alpha: "discard", // "keep"
	      // bitrateMode: "variable", // "constant"
	      // latencyMode: "quality", // "realtime" (faster encoding)
	      // hardwareAcceleration: "no-preference", // "prefer-hardware" "prefer-software"
	      ...this.encoderOptions,
	      codec,
	    };

	    this.encoder.configure(config);
	    if (!(await VideoEncoder.isConfigSupported(config)).supported) {
	      throw new Error(
	        `canvas-record: Unsupported VideoEncoder config\n ${JSON.stringify(
          config,
        )}`,
	      );
	    }
	  }

	  async encode(frame, number) {
	    if (number === 0) await this.muxer.start();

	    const keyFrame = number % this.groupOfPictures === 0;

	    this.encoder.encode(frame, { keyFrame });
	    frame.close();
	    if (this.flushFrequency && (number + 1) % this.flushFrequency === 0) {
	      await this.encoder.flush();
	    }
	  }

	  async stop() {
	    await this.encoder.flush();
	    await this.muxer.finalize();

	    return this.muxer.target?.buffer;
	  }

	  async dispose() {
	    this.encoder = null;
	  }
	}

	/**
	 * @typedef {object} H264MP4EncoderOptions
	 * @property {boolean} [debug]
	 * @property {H264MP4EncoderEncoderOptions} [encoderOptions={}]
	 */
	/**
	 * @typedef {import("h264-mp4-encoder").H264MP4Encoder} H264MP4EncoderEncoderOptions
	 * @see [h264-mp4-encoder#api]{@link https://github.com/TrevorSundberg/h264-mp4-encoder#api}
	 */

	class H264MP4Encoder extends Encoder {
	  static supportedExtensions = ["mp4"];

	  static defaultOptions = {
	    extension: H264MP4Encoder.supportedExtensions[0],
	    frameMethod: "imageData",
	  };

	  /**
	   * @param {H264MP4EncoderOptions} [options]
	   */
	  constructor(options) {
	    super({ ...H264MP4Encoder.defaultOptions, ...options });
	  }

	  async init(options) {
	    super.init(options);

	    this.encoder = await HME.createH264MP4Encoder();

	    Object.assign(this.encoder, {
	      // outputFilename:"output.mp4"
	      width: nextMultiple(this.width, 2),
	      height: nextMultiple(this.height, 2),
	      frameRate: this.frameRate, // 30
	      kbps: estimateBitRate(this.width, this.height, this.frameRate) / 1000, // The bitrate in kbps relative to the frame_rate. Overwrites quantization_parameter if not 0.
	      // speed: 0, // Speed where 0 means best quality and 10 means fastest speed [0..10].
	      // quantizationParameter: 33, // Higher means better compression, and lower means better quality [10..51].
	      // groupOfPictures: 20, // How often a keyframe occurs (key frame period, also known as GOP).
	      // temporalDenoise: false, // Use temporal noise supression.
	      // desiredNaluBytes: 0, // Each NAL unit will be approximately capped at this size (0 means unlimited).
	      debug: this.debug,
	      ...this.encoderOptions,
	    });

	    this.encoder.initialize();
	  }

	  async start() {
	    await super.start();

	    this.step();
	  }

	  encode(frame) {
	    // TODO: addFrameYuv
	    this.encoder.addFrameRgba(frame);
	  }

	  stop() {
	    this.encoder.finalize();

	    return this.encoder.FS.readFile(this.encoder.outputFilename);
	  }

	  dispose() {
	    this.encoder.delete();
	    this.encoder = null;
	  }
	}

	const { GIFEncoder: GIFEnc, quantize, applyPalette } = gifenc__namespace;

	/**
	 * @typedef {object} GIFEncoderOptions
	 * @property {number} [maxColors=256]
	 * @property {GIFEncoderQuantizeOptions} [quantizeOptions]
	 * @property {GIFEncoderEncoderOptions} [encoderOptions={}]
	 */

	/**
	 * @typedef {object} GIFEncoderQuantizeOptions
	 * @property {"rgb565" | "rgb444" | "rgba4444"} [format="rgb565"]
	 * @property {boolean | number} [oneBitAlpha=false]
	 * @property {boolean} [clearAlpha=true]
	 * @property {number} [clearAlphaThreshold=0]
	 * @property {number} [clearAlphaColor=0x00]
	 * @see [QuantizeOptions]{@link https://github.com/mattdesl/gifenc#palette--quantizergba-maxcolors-options--}
	 */
	/**
	 * @typedef {object} GIFEncoderEncoderOptions
	 * @property {number[][]} [palette]
	 * @property {boolean} [first=false]
	 * @property {boolean} [transparent=0]
	 * @property {number} [transparentIndex=0]
	 * @property {number} [delay=0]
	 * @property {number} [repeat=0]
	 * @property {number} [dispose=-1]
	 * @see [WriteFrameOpts]{@link https://github.com/mattdesl/gifenc#gifwriteframeindex-width-height-opts--}
	 */

	class GIFEncoder extends Encoder {
	  static supportedExtensions = ["gif"];

	  static defaultOptions = {
	    extension: GIFEncoder.supportedExtensions[0],
	    frameMethod: "imageData",
	    maxColors: 256,
	    quantizeOptions: {
	      format: "rgb565", // rgb444 or rgba4444
	      oneBitAlpha: false,
	      clearAlpha: true,
	      clearAlphaThreshold: 0,
	      clearAlphaColor: 0x00,
	    },
	  };

	  /**
	   * @param {GIFEncoderOptions} [options]
	   */
	  constructor(options) {
	    super({ ...GIFEncoder.defaultOptions, ...options });
	  }

	  async init(options) {
	    super.init(options);

	    this.encoder = GIFEnc();
	  }

	  async start() {
	    await super.start();

	    this.step();
	  }

	  encode(frame) {
	    const palette = quantize(frame, this.maxColors, this.quantizeOptions);

	    const index = applyPalette(frame, palette, this.quantizeOptions.format);

	    this.encoder.writeFrame(index, this.width, this.height, {
	      palette,
	      delay: (1 / this.frameRate) * 1000,
	      ...this.encoderOptions,
	    });
	  }

	  stop() {
	    this.encoder.finish();

	    const data = this.encoder.bytes();
	    this.encoder.reset();
	    return data;
	  }

	  dispose() {
	    this.encoder = null;
	  }
	}

	/** @class */
	class FrameEncoder extends Encoder {
	  static supportedExtensions = ["png", "jpg"];
	  static supportedTargets = ["in-browser", "file-system"];

	  static defaultOptions = {
	    extension: FrameEncoder.supportedExtensions[0],
	    frameMethod: "blob",
	  };

	  constructor(options) {
	    super({ ...FrameEncoder.defaultOptions, ...options });
	  }

	  async init(options) {
	    super.init(options);

	    if (this.target === "file-system") {
	      this.directory ||= await this.getDirectory();
	      this.directoryHandle = await this.getDirectoryHandle(
	        this.directory,
	        this.filename,
	      );
	    }
	  }

	  async writeFile(frameFileName, blob) {
	    try {
	      if (this.directoryHandle) {
	        const fileHandle = await this.getFileHandle(frameFileName);
	        const writable = await this.getWritableFileStream(fileHandle);
	        await writable.write(blob);
	        await writable.close();
	      } else {
	        downloadBlob(frameFileName, [blob], this.mimeType);
	        // Ugh. Required otherwise frames are skipped
	        await new Promise((r) => setTimeout(r, 100));
	      }
	    } catch (error) {
	      console.error(error);
	    }
	  }

	  async encode(frame, frameNumber) {
	    await this.writeFile(
	      `${`${frameNumber}`.padStart(5, "0")}.${this.extension}`,
	      frame,
	    );
	  }
	}

	/**
	 * Enum for recorder status
	 * @readonly
	 * @enum {number}
	 *
	 * @example
	 * ```js
	 * // Check recorder status before continuing
	 * if (canvasRecorder.status !== RecorderStatus.Stopped) {
	 *   rAFId = requestAnimationFrame(() => tick());
	 * }
	 * ```
	 */
	const RecorderStatus = Object.freeze({
	  Ready: 0,
	  Initializing: 1,
	  Recording: 2,
	  Stopping: 3,
	  Stopped: 4,
	});

	/**
	 * A callback to notify on the status change. To compare with RecorderStatus enum values.
	 * @callback onStatusChangeCb
	 * @param {number} RecorderStatus the status
	 */

	/**
	 * @typedef {object} RecorderOptions Options for recording. All optional.
	 * @property {string} [name=""] A name for the recorder, used as prefix for the default file name.
	 * @property {number} [duration=10] The recording duration in seconds. If set to Infinity, `await canvasRecorder.stop()` needs to be called manually.
	 * @property {number} [frameRate=30] The frame rate in frame per seconds. Use `await canvasRecorder.step();` to go to the next frame.
	 * @property {Array} [rect=[]] Sub-region [x, y, width, height] of the canvas to encode from bottom left. Default to 0, 0 and context.drawingBufferWidth/drawingBufferHeight or canvas.width/height.
	 * @property {boolean} [download=true] Automatically download the recording when duration is reached or when `await canvasRecorder.stop()` is manually called.
	 * @property {string} [extension="mp4"] Default file extension: infers which Encoder is selected.
	 * @property {string} [target="in-browser"] Default writing target: in-browser or file-system when available.
	 * @property {object} [encoder] A specific encoder. Default encoder based on options.extension: GIF > WebCodecs > H264MP4.
	 * @property {object} [encoderOptions] See `src/encoders` or individual packages for a list of options.
	 * @property {object} [muxerOptions] See "mediabunny" for a list of options.
	 * @property {object} [frameOptions] Options for createImageBitmap(), VideoFrame, getImageData() or canvas-screenshot.
	 * @property {onStatusChangeCb} [onStatusChange]
	 */

	/**
	 * @typedef {object} RecorderStartOptions Options for recording initialisation. All optional.
	 * @property {string} [filename] Overwrite the file name completely.
	 * @property {boolean} [initOnly] Only initialised the recorder and don't call the first await recorder.step().
	 */

	class Recorder {
	  /**
	   * Sensible defaults for recording so that the recorder "just works".
	   * @type {RecorderOptions}
	   */
	  static defaultOptions = {
	    name: "",
	    duration: 10, // 0 to Infinity
	    frameRate: 30,
	    rect: [],
	    download: true,
	    extension: "mp4",
	    target: "in-browser",
	    onStatusChange: () => {},
	  };

	  /**
	   * A mapping of extension to their mime types
	   * @type {object}
	   */
	  static mimeTypes = {
	    mkv: "video/x-matroska;codecs=avc1",
	    mov: "video/quicktime",
	    webm: "video/webm",
	    mp4: "video/mp4",
	    gif: "image/gif",
	  };

	  set width(value) {
	    this.encoder.width = value;
	  }
	  set height(value) {
	    this.encoder.height = value;
	  }

	  get x() {
	    return this.rect[0] ?? 0;
	  }
	  get y() {
	    return this.rect[1] ?? 0;
	  }
	  // Only used if rect is defined
	  get yFlipped() {
	    return this.canvasHeight - this.rect[1] - this.rect[3];
	  }
	  get width() {
	    return this.rect[2] ?? this.canvasWidth;
	  }
	  get height() {
	    return this.rect[3] ?? this.canvasHeight;
	  }
	  get canvasWidth() {
	    return this.context.drawingBufferWidth ?? this.context.canvas.width;
	  }
	  get canvasHeight() {
	    return this.context.drawingBufferHeight ?? this.context.canvas.height;
	  }

	  get stats() {
	    if (this.status !== RecorderStatus.Recording) return undefined;

	    const renderTime = (Date.now() - this.startTime.getTime()) / 1000;
	    const secondsPerFrame = renderTime / this.frame;

	    return {
	      renderTime,
	      secondsPerFrame,
	      detail: `Time: ${this.time.toFixed(2)} / ${this.duration.toFixed(2)}
Frame: ${this.frame} / ${this.frameTotal}
Elapsed Time: ${formatSeconds(renderTime)}
Remaining Time: ${formatSeconds(secondsPerFrame * this.frameTotal - renderTime)}
Speedup: x${(this.time / renderTime).toFixed(3)}`,
	    };
	  }

	  #updateStatus(status) {
	    this.status = status;
	    this.onStatusChange(this.status);
	  }

	  getParamString() {
	    return `${this.width}x${this.height}@${this.frameRate}fps`;
	  }

	  getDefaultFileName(extension) {
	    return `${[this.name, formatDate(this.startTime), this.getParamString()]
      .filter(Boolean)
      .join("-")}.${extension}`;
	  }

	  getSupportedExtension() {
	    const CurrentEncoder = this.encoder.constructor;
	    const isExtensionSupported = CurrentEncoder.supportedExtensions.includes(
	      this.extension,
	    );
	    const extension = isExtensionSupported
	      ? this.extension
	      : CurrentEncoder.supportedExtensions[0];

	    if (!isExtensionSupported) {
	      console.warn(
	        `canvas-record: unsupported extension for encoder "${CurrentEncoder.name}". Defaulting to "${extension}".`,
	      );
	    }
	    return extension;
	  }

	  getSupportedTarget() {
	    const CurrentEncoder = this.encoder.constructor;
	    let isTargetSupported = CurrentEncoder.supportedTargets.includes(
	      this.target,
	    );

	    if (this.target === "file-system" && !("showSaveFilePicker" in window)) {
	      isTargetSupported = false;
	    }

	    const target = isTargetSupported
	      ? this.target
	      : CurrentEncoder.supportedTargets[0];

	    if (!isTargetSupported) {
	      console.warn(
	        `canvas-record: unsupported target for encoder "${CurrentEncoder.name}". Defaulting to "${target}".`,
	      );
	    }
	    return target;
	  }

	  /**
	   * Create a Recorder instance
	   * @class Recorder
	   * @param {RenderingContext} context
	   * @param {RecorderOptions} [options={}]
	   */
	  constructor(context, options = {}) {
	    this.context = context;

	    const opts = { ...Recorder.defaultOptions, ...options };
	    Object.assign(this, opts);

	    if (!this.encoder) {
	      if (this.extension === "gif") {
	        this.encoder = new GIFEncoder(opts);
	      } else if (["png", "jpg"].includes(this.extension)) {
	        this.encoder = new FrameEncoder(opts);
	      } else {
	        this.encoder = isWebCodecsSupported
	          ? new WebCodecsEncoder(opts)
	          : new H264MP4Encoder(opts);
	      }
	    }

	    this.is2D = context instanceof CanvasRenderingContext2D;
	    this.#updateStatus(RecorderStatus.Ready);
	  }

	  /**
	   * Sets up the recorder internals and the encoder depending on supported features.
	   * @private
	   */
	  async init({ filename } = {}) {
	    this.#updateStatus(RecorderStatus.Initializing);

	    this.deltaTime = 1 / this.frameRate;
	    this.time = 0;
	    this.frame = 0;
	    this.frameTotal = this.duration * this.frameRate;

	    const extension = this.getSupportedExtension();
	    const target = this.getSupportedTarget();

	    this.startTime = new Date();
	    this.filename = filename || this.getDefaultFileName(extension);

	    await this.encoder.init({
	      encoderOptions: this.encoderOptions,
	      muxerOptions: this.muxerOptions,
	      canvas: this.context.canvas,
	      width: this.width,
	      height: this.height,
	      frameRate: this.frameRate,
	      extension,
	      target,
	      mimeType: Recorder.mimeTypes[extension],
	      filename: this.filename,
	      debug: this.debug,
	    });

	    this.#updateStatus(RecorderStatus.Initialized);
	  }

	  /**
	   * Start the recording by initializing and optionally calling the initial step.
	   * @param {RecorderStartOptions} [startOptions={}]
	   */
	  async start(startOptions = {}) {
	    await this.init(startOptions);

	    // Ensure initializing worked
	    if (this.status !== RecorderStatus.Initialized) {
	      console.debug("canvas-record: recorder not initialized.");
	      return;
	    }

	    this.#updateStatus(RecorderStatus.Recording);

	    if (!startOptions.initOnly) await this.step();
	  }

	  /**
	   * Convert the context into something encodable (bitmap, blob, buffer...)
	   * @private
	   */
	  async getFrame(frameMethod) {
	    switch (frameMethod) {
	      case "bitmap": {
	        return await createImageBitmap(
	          this.context.canvas,
	          ...(this.rect.length
	            ? [
	                this.x,
	                this.yFlipped,
	                this.width,
	                this.height,
	                this.frameOptions,
	              ]
	            : [this.frameOptions]),
	        );
	      }
	      case "videoFrame": {
	        let { canvas } = this.context;

	        // Note: visibleRect doesn't crop in WebGL so we need to capture
	        let visibleRect;
	        if (this.rect.length) {
	          const { x, yFlipped: y, width, height } = this;

	          if (this.is2D) {
	            visibleRect = { x, y, width, height };
	          } else {
	            canvas = captureCanvasRegion(canvas, x, y, width, height);
	          }
	        }

	        return new VideoFrame(canvas, {
	          timestamp: this.time * 1_000_000, // in µs
	          duration: 1_000_000 / this.frameRate,
	          visibleRect,
	          ...this.frameOptions,
	        });
	      }
	      case "requestFrame": {
	        return undefined;
	      }
	      case "imageData": {
	        if (!this.is2D) {
	          const width = this.width;
	          const height = this.height;
	          const length = width * height * 4;
	          const pixels = new Uint8Array(length);
	          const pixelsFlipped = new Uint8Array(length);

	          this.context.readPixels(
	            this.x,
	            this.y,
	            width,
	            height,
	            this.context.RGBA,
	            this.context.UNSIGNED_BYTE,
	            pixels,
	          );

	          // Flip vertically
	          const row = width * 4;
	          const end = (height - 1) * row;
	          for (let i = 0; i < length; i += row) {
	            pixelsFlipped.set(pixels.subarray(i, i + row), end - i);
	          }

	          return pixelsFlipped;
	        }

	        return this.context.getImageData(
	          this.x,
	          this.yFlipped,
	          nextMultiple(this.width, 2),
	          nextMultiple(this.height, 2),
	          this.frameOptions,
	        ).data;
	      }
	      default: {
	        const canvas = this.rect.length
	          ? captureCanvasRegion(
	              this.context.canvas,
	              this.x,
	              this.yFlipped,
	              this.width,
	              this.height,
	            )
	          : this.context.canvas;
	        return await canvasScreenshot(canvas, {
	          useBlob: true,
	          download: false,
	          filename: `output.${this.encoder.extension}`,
	          ...this.frameOptions,
	        });
	      }
	    }
	  }

	  /**
	   * Encode a frame and increment the time and the playhead.
	   * Calls `await canvasRecorder.stop()` when duration is reached.
	   */
	  async step() {
	    if (
	      this.status === RecorderStatus.Recording &&
	      this.frame < this.frameTotal
	    ) {
	      await this.encoder.encode(
	        await this.getFrame(this.encoder.frameMethod),
	        this.frame,
	      );
	      this.time += this.deltaTime;
	      this.frame++;
	    } else {
	      await this.stop();
	    }
	  }

	  /**
	   * Stop the recording and return the recorded buffer.
	   * If options.download is set, automatically start downloading the resulting file.
	   * Is called when duration is reached or manually.
	   * @returns {(ArrayBuffer|Uint8Array|Blob[]|undefined)}
	   */
	  async stop() {
	    if (this.status !== RecorderStatus.Recording) return;

	    this.#updateStatus(RecorderStatus.Stopping);

	    const buffer = await this.encoder.stop();

	    if (this.download && buffer) {
	      downloadBlob(
	        this.filename,
	        Array.isArray(buffer) ? buffer : [buffer],
	        this.encoder.mimeType,
	      );
	    }
	    this.#updateStatus(RecorderStatus.Stopped);

	    return buffer;
	  }

	  /**
	   * Clean up the recorder and encoder
	   */
	  async dispose() {
	    await this.encoder.dispose();
	  }
	}

	var YA = (() => {
	    var c = (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('canvas-record.iife.js', document.baseURI).href);
	    return function (D) {
	      var C = D || {},
	        C = typeof C < "u" ? C : {},
	        s,
	        y;
	      ((C.ready = new Promise(function (A, I) {
	        ((s = A), (y = I));
	      })),
	        (C.create_buffer = function (I) {
	          return C._malloc(I);
	        }),
	        (C.free_buffer = function (I) {
	          return C._free(I);
	        }),
	        (C.locateFile = function (I, g) {
	          return (
	            C.simd && (I = I.replace(/\.wasm$/i, ".simd.wasm")),
	            C.getWasmPath ? C.getWasmPath(I, g, C.simd) : g + I
	          );
	        }),
	        (C.createWebCodecsEncoder = function (I) {
	          return Fg(C, I);
	        }));
	      var e = Object.assign({}, C),
	        b = typeof window == "object",
	        W = typeof importScripts == "function";
	        typeof process == "object" &&
	          typeof process.versions == "object" &&
	          typeof process.versions.node == "string";
	        var f = "";
	      function U(A) {
	        return C.locateFile ? C.locateFile(A, f) : f + A;
	      }
	      var q;
	      (b || W) &&
	        (W
	          ? (f = self.location.href)
	          : typeof document < "u" &&
	            document.currentScript &&
	            (f = document.currentScript.src),
	        c && (f = c),
	        f.indexOf("blob:") !== 0
	          ? (f = f.substr(0, f.replace(/[?#].*/, "").lastIndexOf("/") + 1))
	          : (f = ""),
	        W &&
	          (q = (A) => {
	            try {
	              var I = new XMLHttpRequest();
	              return (
	                I.open("GET", A, !1),
	                (I.responseType = "arraybuffer"),
	                I.send(null),
	                new Uint8Array(I.response)
	              );
	            } catch (B) {
	              var g = nA(A);
	              if (g) return g;
	              throw B;
	            }
	          }),
	        ((A) => (document.title = A)));
	      C.print || console.log.bind(console);
	        var J = C.printErr || console.warn.bind(console);
	      (Object.assign(C, e),
	        (e = null),
	        C.arguments && (C.arguments),
	        C.thisProgram && (C.thisProgram),
	        C.quit && (C.quit));
	      var T = 4,
	        x;
	      C.wasmBinary && (x = C.wasmBinary);
	      C.noExitRuntime || true;
	      typeof WebAssembly != "object" && $("no native wasm support detected");
	      var P,
	        w = false;
	      function l(A, I, g) {
	        for (var B = I + g, Q = ""; !(I >= B); ) {
	          var i = A[I++];
	          if (!i) return Q;
	          if (!(i & 128)) {
	            Q += String.fromCharCode(i);
	            continue;
	          }
	          var n = A[I++] & 63;
	          if ((i & 224) == 192) {
	            Q += String.fromCharCode(((i & 31) << 6) | n);
	            continue;
	          }
	          var E = A[I++] & 63;
	          if (
	            ((i & 240) == 224
	              ? (i = ((i & 15) << 12) | (n << 6) | E)
	              : (i = ((i & 7) << 18) | (n << 12) | (E << 6) | (A[I++] & 63)),
	            i < 65536)
	          )
	            Q += String.fromCharCode(i);
	          else {
	            var o = i - 65536;
	            Q += String.fromCharCode(55296 | (o >> 10), 56320 | (o & 1023));
	          }
	        }
	        return Q;
	      }
	      function G(A, I) {
	        return A ? l(u, A, I) : "";
	      }
	      function R(A, I, g, B) {
	        if (!(B > 0)) return 0;
	        for (var Q = g, i = g + B - 1, n = 0; n < A.length; ++n) {
	          var E = A.charCodeAt(n);
	          if (E >= 55296 && E <= 57343) {
	            var o = A.charCodeAt(++n);
	            E = (65536 + ((E & 1023) << 10)) | (o & 1023);
	          }
	          if (E <= 127) {
	            if (g >= i) break;
	            I[g++] = E;
	          } else if (E <= 2047) {
	            if (g + 1 >= i) break;
	            ((I[g++] = 192 | (E >> 6)), (I[g++] = 128 | (E & 63)));
	          } else if (E <= 65535) {
	            if (g + 2 >= i) break;
	            ((I[g++] = 224 | (E >> 12)),
	              (I[g++] = 128 | ((E >> 6) & 63)),
	              (I[g++] = 128 | (E & 63)));
	          } else {
	            if (g + 3 >= i) break;
	            ((I[g++] = 240 | (E >> 18)),
	              (I[g++] = 128 | ((E >> 12) & 63)),
	              (I[g++] = 128 | ((E >> 6) & 63)),
	              (I[g++] = 128 | (E & 63)));
	          }
	        }
	        return ((I[g] = 0), g - Q);
	      }
	      function eA(A, I, g) {
	        return R(A, u, I, g);
	      }
	      function PA(A) {
	        for (var I = 0, g = 0; g < A.length; ++g) {
	          var B = A.charCodeAt(g);
	          B <= 127
	            ? I++
	            : B <= 2047
	              ? (I += 2)
	              : B >= 55296 && B <= 57343
	                ? ((I += 4), ++g)
	                : (I += 3);
	        }
	        return I;
	      }
	      var tA, u, z, aA, j, k, uA, HA;
	      function UA() {
	        var A = P.buffer;
	        ((C.HEAP8 = tA = new Int8Array(A)),
	          (C.HEAP16 = z = new Int16Array(A)),
	          (C.HEAP32 = j = new Int32Array(A)),
	          (C.HEAPU8 = u = new Uint8Array(A)),
	          (C.HEAPU16 = aA = new Uint16Array(A)),
	          (C.HEAPU32 = k = new Uint32Array(A)),
	          (C.HEAPF32 = uA = new Float32Array(A)),
	          (C.HEAPF64 = HA = new Float64Array(A)));
	      }
	      C.INITIAL_MEMORY || 16777216;
	        var kA,
	        SA = [],
	        MA = [],
	        JA = [];
	      function $A() {
	        if (C.preRun)
	          for (
	            typeof C.preRun == "function" && (C.preRun = [C.preRun]);
	            C.preRun.length;

	          )
	            gI(C.preRun.shift());
	        sA(SA);
	      }
	      function AI() {
	        (sA(MA));
	      }
	      function II() {
	        if (C.postRun)
	          for (
	            typeof C.postRun == "function" && (C.postRun = [C.postRun]);
	            C.postRun.length;

	          )
	            BI(C.postRun.shift());
	        sA(JA);
	      }
	      function gI(A) {
	        SA.unshift(A);
	      }
	      function CI(A) {
	        MA.unshift(A);
	      }
	      function BI(A) {
	        JA.unshift(A);
	      }
	      var V = 0,
	        CA = null;
	      function QI(A) {
	        (V++, C.monitorRunDependencies && C.monitorRunDependencies(V));
	      }
	      function EI(A) {
	        if (
	          (V--,
	          C.monitorRunDependencies && C.monitorRunDependencies(V),
	          V == 0 && (CA))
	        ) {
	          var I = CA;
	          ((CA = null), I());
	        }
	      }
	      function $(A) {
	        (C.onAbort && C.onAbort(A),
	          (A = "Aborted(" + A + ")"),
	          J(A),
	          (w = true),
	          (A += ". Build with -sASSERTIONS for more info."));
	        var I = new WebAssembly.RuntimeError(A);
	        throw (y(I), I);
	      }
	      var KA = "data:application/octet-stream;base64,";
	      function DA(A) {
	        return A.startsWith(KA);
	      }
	      var S;
	      ((S =
	        "data:application/octet-stream;base64,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NwMYIANBADYCFCADQbgcNgIQIAMgATYCDCADQegcNgIIIAEgBWohAUEAIQUCQCAGQegcQQAQGQRAIANBATYCOCAGIANBCGogASABQQFBACAGKAIAKAIUEQkAIAFBACADKAIgQQFGGyEFDAELIAYgA0EIaiABQQFBACAGKAIAKAIYEQgAAkACQCADKAIsDgIAAQILIAMoAhxBACADKAIoQQFGG0EAIAMoAiRBAUYbQQAgAygCMEEBRhshBQwBCyADKAIgQQFHBEAgAygCMA0BIAMoAiRBAUcNASADKAIoQQFHDQELIAMoAhghBQsgA0FAayQAQQAgBSIBRQ0AGiAEQQhqIgNBBHJBAEE0EB4gBEEBNgI4IARBfzYCFCAEIAA2AhAgBCABNgIIIAEgAyACKAIAQQEgASgCACgCHBEDACAEKAIgIgBBAUYEQCACIAQoAhg2AgALIABBAUYLIQAgBEFAayQAIAALCgAgACABQQAQGQsEACAACyMBAX9BsCAoAgAiAARAA0AgACgCABEHACAAKAIEIgANAAsLCyQBAn8gACgCBCIAEB1BAWoiARAYIgIEfyACIAAgARAaBUEACwsFAEHkFQsTACAAQQRqQQAgASgCBEG4FUYbC9QBAwJ/AXwBfiMAQSBrIgQkACADKQMAIQcgAigCACECIAQgASgCADYCCEHAHiAEQQhqIgUQCCEBIAQgAjYCCEGoHiAFEAghAiAEIAc+AghBqB4gBEEIahAIIQMgARAGIAQgATYCCCACEAYgBCACNgIQIAMQBiAEIAM2AhggACgCBEEDQawVIAUQFiIAQZweIAUQCiEGIAQoAggQCSAAEAEgAxABIAIQASABEAECfyAGmUQAAAAAAADgQWMEQCAGqgwBC0GAgICAeAshAyAEQSBqJAAgAwsNACAAKAIEEAEgABAXCwkAIAAoAgQQAQsaACABIAAoAgQiADYCBCABQewTNgIAIAAQBgsiAQF/QQgQHyIBIAAoAgQiADYCBCABQewTNgIAIAAQBiABCxUAIABB7BM2AgAgACgCBBABIAAQFwsTACAAQewTNgIAIAAoAgQQASAACwkAIAEgABEAAAsNACABIAIgAyAAEQUAC0ABAX8jAEEQayIDJAAgAyACNgIAIAMgATYCCCADQQhqIAMgABEGACEAIAMoAgAQASADKAIIEAEgA0EQ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IABBAToADCABQQE6AAwgACAAKAIEIgIoAgAiATYCBCABBEAgASAANgIICyACIAAoAgg2AgggACgCCCIBIAEoAgAgAEdBAnRqIAI2AgAgAiAANgIAIAAgAjYCCAwECyABRQRAIABBAToADCACQQA6AAwgAiAAKAIEIgE2AgAgAQRAIAEgAjYCCAsgACACKAIINgIIIAIoAggiASABKAIAIAJHQQJ0aiAANgIAIAAgAjYCBCACIAA2AgggACADIAIgA0YbIQMgAigCACEACwJAAkAgACgCACIBRQ0AIAEtAAwNACAAIQIMAQsCQCAAKAIEIgIEQCACLQAMRQ0BCyAAQQA6AAwgACgCCCIALQAMQQAgACADRxsNAiAAQQE6AAwMBQsgAQRAIAEtAAxFBEAgACECDAILIAAoAgQhAgsgAkEBOgAMIABBADoADCAAIAIoAgAiATYCBCABBEAgASAANgIICyACIAAoAgg2AgggACgCCCIBIAEoAgAgAEdBAnRqIAI2AgAgAiAANgIAIAAgAjYCCCAAIQELIAIgAigCCCIALQAMOgAMIABBAToADCABQQE6AAwgACAAKAIAIgIoAgQiATYCACABBEAgASAANgIICyACIAAoAgg2AgggACgCCCIBIAEoAgAgAEdBAnRqIAI2AgAgAiAANgIEIAAgAjYCCAwDCyAAKAIIIgIgAigCACAARkECdGooAgAhAAwACwALIAFBAToADAsgBBAXCwtfAQF/IwBBEGsiBCQAIAQgATYCDCAEIAI2AgggBCAAQv////8PgzcDACADQbgbaigCACIBRQRAEDYACyABIARBDGogBEEIaiAEIAEoAgAoAhgRCgAhASAEQRBqJAAgAQudDAMKfwJ8AX0jAEEgayICJAAgACgCAEHUCxAFIgQQBCEDIAQQASADQageIAIQCiEMIAIoAgAQCSADEAEgACgCAEHFCBAFIgQQBCEDIAQQASADQageIAIQCiENIAIoAgAQCSADEAEgACgCAEG+CRAFIgQQBCEDIAQQAQJ/IAxEAAAAAAAA8EFjIAxEAAAAAAAAAABmcQRAIAyrDAELQQALIQgCfyANRAAAAAAAAPBBYyANRAAAAAAAAAAAZnEEQCANqwwBC0EACyEKQwAA8EEhDiADEA8EQCAAKAIAQb4JEAUiBRAEIQQgBRABIARB5B4gAhAK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cHMAKHVuc2lnbmVkKShwIC0gYmFzZSkgPD0gaW5kZXhfYnl0ZXMAKGgtPmNhcGFjaXR5IC0gaC0+Ynl0ZXMpID49IGJ5dGVzAGZpbmFsaXplX211eGVyAGNyZWF0ZV9tdXhlcgBWaWRlb0hhbmRsZXIAU291bmRIYW5kbGVyAHBhdGNoX3NsaWNlX2hlYWRlcgB1bnNpZ25lZCBjaGFyAHRyLT5pbmZvLnRyYWNrX21lZGlhX2tpbmQgPT0gZV92aWRlbwBmcmFnbWVudGF0aW9uAGJvb2wAbWluaW1wNF92ZWN0b3JfYWxsb2NfdGFpbABlbXNjcmlwdGVuOjp2YWwAbXV4X25hbABzZXF1ZW50aWFsAHdpZHRoAC9Vc2Vycy9kYW1pZW5zZWd1aW4vUHJvamVjdHMvb3NzLyNmb3JrL21wNC13YXNtL3NyYy9taW5pbXA0L21pbmltcDQuaAB1bnNpZ25lZCBsb25nAHN0ZDo6d3N0cmluZwBzdGQ6OnN0cmluZwBzdGQ6OnUxNnN0cmluZwBzdGQ6OnUzMnN0cmluZwBtdXgtPnNlcXVlbnRpYWxfbW9kZV9mbGFnAGRvdWJsZQB2b2lkAGNoYW5nZV9zcHNfaWQAaGV2YwB3cml0ZV9wZW5kaW5nX2RhdGEAaC0+ZGF0YQBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgc2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgaW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGNoYXI+AHN0ZDo6YmFzaWNfc3RyaW5nPHVuc2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxkb3VibGU+AG4gPiAwICYmIG4gPD0gMTYAcHBzX2lkIDw9IDI1NQAodW5zaWduZWQpbiA8PSAzMgAtYnMtPnNoaWZ0IDwgMzIAc3BzX2lkIDw9IDMxAChpbnQpcG9zX2JpdHMgPj0gMAAhKHZhbCA+PiBuKQAAACgPAACoCQAAqAkAAE4xMGVtc2NyaXB0ZW4zdmFsRQAAgA8AAJQJAABpaWlpAEHAEwvSDMgOAAAoDwAAQA8AABwPAAB2aWlpaQAAAMgOAAAoDwAAdmlpAAAAAACgCgAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABEAAAASAAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJWjEyY3JlYXRlX211eGVyTjEwZW1zY3JpcHRlbjN2YWxFUzNfRTMkXzBOU185YWxsb2NhdG9ySVM0X0VFRmlQS3ZteEVFRQBOU3QzX18yMTBfX2Z1bmN0aW9uNl9fYmFzZUlGaVBLdm14RUVFAIAPAAByCgAAqA8AABAKAACYCgAAqAkAAKgJAACoCQAAWjEyY3JlYXRlX211eGVyTjEwZW1zY3JpcHRlbjN2YWxFUzBfRTMkXzAAAACADwAAuAoAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFAACADwAA7AoAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0loTlNfMTFjaGFyX3RyYWl0c0loRUVOU185YWxsb2NhdG9ySWhFRUVFAACADwAANAsAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0l3TlNfMTFjaGFyX3RyYWl0c0l3RUVOU185YWxsb2NhdG9ySXdFRUVFAACADwAAfAsAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEc05TXzExY2hhcl90cmFpdHNJRHNFRU5TXzlhbGxvY2F0b3JJRHNFRUVFAAAAgA8AAMQLAABOU3QzX18yMTJiYXNpY19zdHJpbmdJRGlOU18xMWNoYXJfdHJhaXRzSURpRUVOU185YWxsb2NhdG9ySURpRUVFRQAAAIAPAAAQDAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJY0VFAACADwAAXAwAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWFFRQAAgA8AAIQMAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0loRUUAAIAPAACsDAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJc0VFAACADwAA1AwAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXRFRQAAgA8AAPwMAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lpRUUAAIAPAAAkDQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJakVFAACADwAATA0AAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWxFRQAAgA8AAHQNAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ltRUUAAIAPAACcDQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZkVFAACADwAAxA0AAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWRFRQAAgA8AAOwNAABOMTBfX2N4eGFiaXYxMTZfX3NoaW1fdHlwZV9pbmZvRQAAAACoDwAAFA4AAAwQAABOMTBfX2N4eGFiaXYxMTdfX2NsYXNzX3R5cGVfaW5mb0UAAACoDwAARA4AADgOAAAAAAAAuA4AABQAAAAVAAAAFgAAABcAAAAYAAAATjEwX19jeHhhYml2MTIzX19mdW5kYW1lbnRhbF90eXBlX2luZm9FAKgPAACQDgAAOA4AAHYAAAB8DgAAxA4AAGIAAAB8DgAA0A4AAGMAAAB8DgAA3A4AAGgAAAB8DgAA6A4AAGEAAAB8DgAA9A4AAHMAAAB8DgAAAA8AAHQAAAB8DgAADA8AAGkAAAB8DgAAGA8AAGoAAAB8DgAAJA8AAGwAAAB8DgAAMA8AAG0AAAB8DgAAPA8AAHgAAAB8DgAASA8AAHkAAAB8DgAAVA8AAGYAAAB8DgAAYA8AAGQAAAB8DgAAbA8AAAAAAABoDgAAFAAAABkAAAAWAAAAFwAAABoAAAAbAAAAHAAAAB0AAAAAAAAA8A8AABQAAAAeAAAAFgAAABcAAAAaAAAAHwAAACAAAAAhAAAATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAAAAAKgPAADIDwAAaA4AAFN0OXR5cGVfaW5mbwAAAACADwAA/A8AQZQgCwcBAAAAQBIB"),
	        DA(S) || (S = U(S)));
	      function LA(A) {
	        try {
	          if (A == S && x) return new Uint8Array(x);
	          var I = nA(A);
	          if (I) return I;
	          if (q) return q(A);
	          throw "both async and sync fetching of the wasm failed";
	        } catch (g) {
	          $(g);
	        }
	      }
	      function iI() {
	        return !x && (b || W) && typeof fetch == "function"
	          ? fetch(S, { credentials: "same-origin" })
	              .then(function (A) {
	                if (!A.ok)
	                  throw "failed to load wasm binary file at '" + S + "'";
	                return A.arrayBuffer();
	              })
	              .catch(function () {
	                return LA(S);
	              })
	          : Promise.resolve().then(function () {
	              return LA(S);
	            });
	      }
	      function oI() {
	        var A = { a: tg };
	        function I(n, E) {
	          var o = n.exports;
	          ((C.asm = o),
	            (P = C.asm.x),
	            UA(),
	            (kA = C.asm.B),
	            CI(C.asm.y),
	            EI());
	        }
	        QI();
	        function g(n) {
	          I(n.instance);
	        }
	        function B(n) {
	          return iI()
	            .then(function (E) {
	              return WebAssembly.instantiate(E, A);
	            })
	            .then(function (E) {
	              return E;
	            })
	            .then(n, function (E) {
	              (J("failed to asynchronously prepare wasm: " + E), $(E));
	            });
	        }
	        function Q() {
	          return !x &&
	            typeof WebAssembly.instantiateStreaming == "function" &&
	            !DA(S) &&
	            typeof fetch == "function"
	            ? fetch(S, { credentials: "same-origin" }).then(function (n) {
	                var E = WebAssembly.instantiateStreaming(n, A);
	                return E.then(g, function (o) {
	                  return (
	                    J("wasm streaming compile failed: " + o),
	                    J("falling back to ArrayBuffer instantiation"),
	                    B(g)
	                  );
	                });
	              })
	            : B(g);
	        }
	        if (C.instantiateWasm)
	          try {
	            var i = C.instantiateWasm(A, I);
	            return i;
	          } catch (n) {
	            (J("Module.instantiateWasm callback failed with error: " + n),
	              y(n));
	          }
	        return (Q().catch(y), {});
	      }
	      function sA(A) {
	        for (; A.length > 0; ) A.shift()(C);
	      }
	      function rI(A, I, g, B) {
	        $(
	          "Assertion failed: " +
	            G(A) +
	            ", at: " +
	            [I ? G(I) : "unknown filename", g, B ? G(B) : "unknown function"],
	        );
	      }
	      function eI(A, I, g, B, Q) {}
	      function hA(A) {
	        switch (A) {
	          case 1:
	            return 0;
	          case 2:
	            return 1;
	          case 4:
	            return 2;
	          case 8:
	            return 3;
	          default:
	            throw new TypeError("Unknown type size: " + A);
	        }
	      }
	      function tI() {
	        for (var A = new Array(256), I = 0; I < 256; ++I)
	          A[I] = String.fromCharCode(I);
	        pA = A;
	      }
	      var pA = void 0;
	      function H(A) {
	        for (var I = "", g = A; u[g]; ) I += pA[u[g++]];
	        return I;
	      }
	      var AA = {},
	        O = {},
	        iA = {},
	        aI = 48,
	        cI = 57;
	      function vA(A) {
	        if (A === void 0) return "_unknown";
	        A = A.replace(/[^a-zA-Z0-9_]/g, "$");
	        var I = A.charCodeAt(0);
	        return I >= aI && I <= cI ? "_" + A : A;
	      }
	      function mA(A, I) {
	        return (
	          (A = vA(A)),
	          new Function(
	            "body",
	            "return function " +
	              A +
	              `() {
    "use strict";    return body.apply(this, arguments);
};
`,
	          )(I)
	        );
	      }
	      function FA(A, I) {
	        var g = mA(I, function (B) {
	          ((this.name = I), (this.message = B));
	          var Q = new Error(B).stack;
	          Q !== void 0 &&
	            (this.stack =
	              this.toString() +
	              `
` +
	              Q.replace(/^Error(:[^\n]*)?\n/, ""));
	        });
	        return (
	          (g.prototype = Object.create(A.prototype)),
	          (g.prototype.constructor = g),
	          (g.prototype.toString = function () {
	            return this.message === void 0
	              ? this.name
	              : this.name + ": " + this.message;
	          }),
	          g
	        );
	      }
	      var bA = void 0;
	      function Y(A) {
	        throw new bA(A);
	      }
	      var WA = void 0;
	      function TA(A) {
	        throw new WA(A);
	      }
	      function DI(A, I, g) {
	        A.forEach(function (E) {
	          iA[E] = I;
	        });
	        function B(E) {
	          var o = g(E);
	          o.length !== A.length && TA("Mismatched type converter count");
	          for (var r = 0; r < A.length; ++r) L(A[r], o[r]);
	        }
	        var Q = new Array(I.length),
	          i = [],
	          n = 0;
	        (I.forEach((E, o) => {
	          O.hasOwnProperty(E)
	            ? (Q[o] = O[E])
	            : (i.push(E),
	              AA.hasOwnProperty(E) || (AA[E] = []),
	              AA[E].push(() => {
	                ((Q[o] = O[E]), ++n, n === i.length && B(Q));
	              }));
	        }),
	          i.length === 0 && B(Q));
	      }
	      function L(A, I, g = {}) {
	        if (!("argPackAdvance" in I))
	          throw new TypeError(
	            "registerType registeredInstance requires argPackAdvance",
	          );
	        var B = I.name;
	        if (
	          (A ||
	            Y('type "' + B + '" must have a positive integer typeid pointer'),
	          O.hasOwnProperty(A))
	        ) {
	          if (g.ignoreDuplicateRegistrations) return;
	          Y("Cannot register type '" + B + "' twice");
	        }
	        if (((O[A] = I), delete iA[A], AA.hasOwnProperty(A))) {
	          var Q = AA[A];
	          (delete AA[A], Q.forEach((i) => i()));
	        }
	      }
	      function sI(A, I, g, B, Q) {
	        var i = hA(g);
	        ((I = H(I)),
	          L(A, {
	            name: I,
	            fromWireType: function (n) {
	              return !!n;
	            },
	            toWireType: function (n, E) {
	              return E ? B : Q;
	            },
	            argPackAdvance: 8,
	            readValueFromPointer: function (n) {
	              var E;
	              if (g === 1) E = tA;
	              else if (g === 2) E = z;
	              else if (g === 4) E = j;
	              else throw new TypeError("Unknown boolean type size: " + I);
	              return this.fromWireType(E[n >> i]);
	            },
	            destructorFunction: null,
	          }));
	      }
	      var yA = [],
	        M = [
	          {},
	          { value: void 0 },
	          { value: null },
	          { value: true },
	          { value: false },
	        ];
	      function fA(A) {
	        A > 4 && --M[A].refcount === 0 && ((M[A] = void 0), yA.push(A));
	      }
	      function hI() {
	        for (var A = 0, I = 5; I < M.length; ++I) M[I] !== void 0 && ++A;
	        return A;
	      }
	      function FI() {
	        for (var A = 5; A < M.length; ++A) if (M[A] !== void 0) return M[A];
	        return null;
	      }
	      function yI() {
	        ((C.count_emval_handles = hI), (C.get_first_emval = FI));
	      }
	      var d = {
	        toValue: (A) => (
	          A || Y("Cannot use deleted val. handle = " + A),
	          M[A].value
	        ),
	        toHandle: (A) => {
	          switch (A) {
	            case void 0:
	              return 1;
	            case null:
	              return 2;
	            case true:
	              return 3;
	            case false:
	              return 4;
	            default: {
	              var I = yA.length ? yA.pop() : M.length;
	              return ((M[I] = { refcount: 1, value: A }), I);
	            }
	          }
	        },
	      };
	      function wA(A) {
	        return this.fromWireType(j[A >> 2]);
	      }
	      function fI(A, I) {
	        ((I = H(I)),
	          L(A, {
	            name: I,
	            fromWireType: function (g) {
	              var B = d.toValue(g);
	              return (fA(g), B);
	            },
	            toWireType: function (g, B) {
	              return d.toHandle(B);
	            },
	            argPackAdvance: 8,
	            readValueFromPointer: wA,
	            destructorFunction: null,
	          }));
	      }
	      function wI(A, I) {
	        switch (I) {
	          case 2:
	            return function (g) {
	              return this.fromWireType(uA[g >> 2]);
	            };
	          case 3:
	            return function (g) {
	              return this.fromWireType(HA[g >> 3]);
	            };
	          default:
	            throw new TypeError("Unknown float type: " + A);
	        }
	      }
	      function NI(A, I, g) {
	        var B = hA(g);
	        ((I = H(I)),
	          L(A, {
	            name: I,
	            fromWireType: function (Q) {
	              return Q;
	            },
	            toWireType: function (Q, i) {
	              return i;
	            },
	            argPackAdvance: 8,
	            readValueFromPointer: wI(I, B),
	            destructorFunction: null,
	          }));
	      }
	      function RI(A, I) {
	        if (!(A instanceof Function))
	          throw new TypeError(
	            "new_ called with constructor type " +
	              typeof A +
	              " which is not a function",
	          );
	        var g = mA(A.name || "unknownFunctionName", function () {});
	        g.prototype = A.prototype;
	        var B = new g(),
	          Q = A.apply(B, I);
	        return Q instanceof Object ? Q : B;
	      }
	      function XA(A) {
	        for (; A.length; ) {
	          var I = A.pop(),
	            g = A.pop();
	          g(I);
	        }
	      }
	      function GI(A, I, g, B, Q) {
	        var i = I.length;
	        i < 2 &&
	          Y(
	            "argTypes array size mismatch! Must at least get return value and 'this' types!",
	          );
	        for (
	          var n = I[1] !== null && g !== null, E = false, o = 1;
	          o < I.length;
	          ++o
	        )
	          if (I[o] !== null && I[o].destructorFunction === void 0) {
	            E = true;
	            break;
	          }
	        for (
	          var r = I[0].name !== "void", h = "", t = "", o = 0;
	          o < i - 2;
	          ++o
	        )
	          ((h += (o !== 0 ? ", " : "") + "arg" + o),
	            (t += (o !== 0 ? ", " : "") + "arg" + o + "Wired"));
	        var F =
	          "return function " +
	          vA(A) +
	          "(" +
	          h +
	          `) {
if (arguments.length !== ` +
	          (i - 2) +
	          `) {
throwBindingError('function ` +
	          A +
	          " called with ' + arguments.length + ' arguments, expected " +
	          (i - 2) +
	          ` args!');
}
`;
	        E &&
	          (F += `var destructors = [];
`);
	        var _ = E ? "destructors" : "null",
	          X = [
	            "throwBindingError",
	            "invoker",
	            "fn",
	            "runDestructors",
	            "retType",
	            "classParam",
	          ],
	          BA = [Y, B, Q, XA, I[0], I[1]];
	        n &&
	          (F +=
	            "var thisWired = classParam.toWireType(" +
	            _ +
	            `, this);
`);
	        for (var o = 0; o < i - 2; ++o)
	          ((F +=
	            "var arg" +
	            o +
	            "Wired = argType" +
	            o +
	            ".toWireType(" +
	            _ +
	            ", arg" +
	            o +
	            "); // " +
	            I[o + 2].name +
	            `
`),
	            X.push("argType" + o),
	            BA.push(I[o + 2]));
	        if (
	          (n && (t = "thisWired" + (t.length > 0 ? ", " : "") + t),
	          (F +=
	            (r ? "var rv = " : "") +
	            "invoker(fn" +
	            (t.length > 0 ? ", " : "") +
	            t +
	            `);
`),
	          E)
	        )
	          F += `runDestructors(destructors);
`;
	        else
	          for (var o = n ? 1 : 2; o < I.length; ++o) {
	            var IA = o === 1 ? "thisWired" : "arg" + (o - 2) + "Wired";
	            I[o].destructorFunction !== null &&
	              ((F +=
	                IA +
	                "_dtor(" +
	                IA +
	                "); // " +
	                I[o].name +
	                `
`),
	              X.push(IA + "_dtor"),
	              BA.push(I[o].destructorFunction));
	          }
	        (r &&
	          (F += `var ret = retType.fromWireType(rv);
return ret;
`),
	          (F += `}
`),
	          X.push(F));
	        var sg = RI(Function, X).apply(null, BA);
	        return sg;
	      }
	      function YI(A, I, g) {
	        if (A[I].overloadTable === void 0) {
	          var B = A[I];
	          ((A[I] = function () {
	            return (
	              A[I].overloadTable.hasOwnProperty(arguments.length) ||
	                Y(
	                  "Function '" +
	                    g +
	                    "' called with an invalid number of arguments (" +
	                    arguments.length +
	                    ") - expects one of (" +
	                    A[I].overloadTable +
	                    ")!",
	                ),
	              A[I].overloadTable[arguments.length].apply(this, arguments)
	            );
	          }),
	            (A[I].overloadTable = []),
	            (A[I].overloadTable[B.argCount] = B));
	        }
	      }
	      function dI(A, I, g) {
	        C.hasOwnProperty(A)
	          ? ((g === void 0 ||
	              (C[A].overloadTable !== void 0 &&
	                C[A].overloadTable[g] !== void 0)) &&
	              Y("Cannot register public name '" + A + "' twice"),
	            YI(C, A, A),
	            C.hasOwnProperty(g) &&
	              Y(
	                "Cannot register multiple overloads of a function with the same number of arguments (" +
	                  g +
	                  ")!",
	              ),
	            (C[A].overloadTable[g] = I))
	          : ((C[A] = I), g !== void 0 && (C[A].numArguments = g));
	      }
	      function lI(A, I) {
	        for (var g = [], B = 0; B < A; B++) g.push(k[(I + B * 4) >> 2]);
	        return g;
	      }
	      function uI(A, I, g) {
	        (C.hasOwnProperty(A) || TA("Replacing nonexistant public symbol"),
	          C[A].overloadTable !== void 0 && g !== void 0
	            ? (C[A].overloadTable[g] = I)
	            : ((C[A] = I), (C[A].argCount = g)));
	      }
	      function HI(A, I, g) {
	        var B = C["dynCall_" + A];
	        return g && g.length ? B.apply(null, [I].concat(g)) : B.call(null, I);
	      }
	      var oA = [];
	      function ZA(A) {
	        var I = oA[A];
	        return (
	          I || (A >= oA.length && (oA.length = A + 1), (oA[A] = I = kA.get(A))),
	          I
	        );
	      }
	      function UI(A, I, g) {
	        if (A.includes("j")) return HI(A, I, g);
	        var B = ZA(I).apply(null, g);
	        return B;
	      }
	      function kI(A, I) {
	        var g = [];
	        return function () {
	          return ((g.length = 0), Object.assign(g, arguments), UI(A, I, g));
	        };
	      }
	      function SI(A, I) {
	        A = H(A);
	        function g() {
	          return A.includes("j") ? kI(A, I) : ZA(I);
	        }
	        var B = g();
	        return (
	          typeof B != "function" &&
	            Y("unknown function pointer with signature " + A + ": " + I),
	          B
	        );
	      }
	      var qA = void 0;
	      function xA(A) {
	        var I = jA(A),
	          g = H(I);
	        return (p(I), g);
	      }
	      function MI(A, I) {
	        var g = [],
	          B = {};
	        function Q(i) {
	          if (!B[i] && !O[i]) {
	            if (iA[i]) {
	              iA[i].forEach(Q);
	              return;
	            }
	            (g.push(i), (B[i] = true));
	          }
	        }
	        throw (I.forEach(Q), new qA(A + ": " + g.map(xA).join([", "])));
	      }
	      function JI(A, I, g, B, Q, i) {
	        var n = lI(I, g);
	        ((A = H(A)),
	          (Q = SI(B, Q)),
	          dI(
	            A,
	            function () {
	              MI("Cannot call " + A + " due to unbound types", n);
	            },
	            I - 1,
	          ),
	          DI([], n, function (E) {
	            var o = [E[0], null].concat(E.slice(1));
	            return (uI(A, GI(A, o, null, Q, i), I - 1), []);
	          }));
	      }
	      function KI(A, I, g) {
	        switch (I) {
	          case 0:
	            return g
	              ? function (Q) {
	                  return tA[Q];
	                }
	              : function (Q) {
	                  return u[Q];
	                };
	          case 1:
	            return g
	              ? function (Q) {
	                  return z[Q >> 1];
	                }
	              : function (Q) {
	                  return aA[Q >> 1];
	                };
	          case 2:
	            return g
	              ? function (Q) {
	                  return j[Q >> 2];
	                }
	              : function (Q) {
	                  return k[Q >> 2];
	                };
	          default:
	            throw new TypeError("Unknown integer type: " + A);
	        }
	      }
	      function LI(A, I, g, B, Q) {
	        ((I = H(I)));
	        var i = hA(g),
	          n = (t) => t;
	        if (B === 0) {
	          var E = 32 - 8 * g;
	          n = (t) => (t << E) >>> E;
	        }
	        var o = I.includes("unsigned"),
	          r = (t, F) => {},
	          h;
	        (o
	          ? (h = function (t, F) {
	              return (r(F, this.name), F >>> 0);
	            })
	          : (h = function (t, F) {
	              return (r(F, this.name), F);
	            }),
	          L(A, {
	            name: I,
	            fromWireType: n,
	            toWireType: h,
	            argPackAdvance: 8,
	            readValueFromPointer: KI(I, i, B !== 0),
	            destructorFunction: null,
	          }));
	      }
	      function pI(A, I, g) {
	        var B = [
	            Int8Array,
	            Uint8Array,
	            Int16Array,
	            Uint16Array,
	            Int32Array,
	            Uint32Array,
	            Float32Array,
	            Float64Array,
	          ],
	          Q = B[I];
	        function i(n) {
	          n = n >> 2;
	          var E = k,
	            o = E[n],
	            r = E[n + 1];
	          return new Q(E.buffer, r, o);
	        }
	        ((g = H(g)),
	          L(
	            A,
	            {
	              name: g,
	              fromWireType: i,
	              argPackAdvance: 8,
	              readValueFromPointer: i,
	            },
	            { ignoreDuplicateRegistrations: true },
	          ));
	      }
	      function vI(A, I) {
	        I = H(I);
	        var g = I === "std::string";
	        L(A, {
	          name: I,
	          fromWireType: function (B) {
	            var Q = k[B >> 2],
	              i = B + 4,
	              n;
	            if (g)
	              for (var E = i, o = 0; o <= Q; ++o) {
	                var r = i + o;
	                if (o == Q || u[r] == 0) {
	                  var h = r - E,
	                    t = G(E, h);
	                  (n === void 0
	                    ? (n = t)
	                    : ((n += String.fromCharCode(0)), (n += t)),
	                    (E = r + 1));
	                }
	              }
	            else {
	              for (var F = new Array(Q), o = 0; o < Q; ++o)
	                F[o] = String.fromCharCode(u[i + o]);
	              n = F.join("");
	            }
	            return (p(B), n);
	          },
	          toWireType: function (B, Q) {
	            Q instanceof ArrayBuffer && (Q = new Uint8Array(Q));
	            var i,
	              n = typeof Q == "string";
	            (n ||
	              Q instanceof Uint8Array ||
	              Q instanceof Uint8ClampedArray ||
	              Q instanceof Int8Array ||
	              Y("Cannot pass non-string to std::string"),
	              g && n ? (i = PA(Q)) : (i = Q.length));
	            var E = RA(4 + i + 1),
	              o = E + 4;
	            if (((k[E >> 2] = i), g && n)) eA(Q, o, i + 1);
	            else if (n)
	              for (var r = 0; r < i; ++r) {
	                var h = Q.charCodeAt(r);
	                (h > 255 &&
	                  (p(o),
	                  Y("String has UTF-16 code units that do not fit in 8 bits")),
	                  (u[o + r] = h));
	              }
	            else for (var r = 0; r < i; ++r) u[o + r] = Q[r];
	            return (B !== null && B.push(p, E), E);
	          },
	          argPackAdvance: 8,
	          readValueFromPointer: wA,
	          destructorFunction: function (B) {
	            p(B);
	          },
	        });
	      }
	      function mI(A, I) {
	        for (var g = "", B = 0; !(B >= I / 2); ++B) {
	          var Q = z[(A + B * 2) >> 1];
	          if (Q == 0) break;
	          g += String.fromCharCode(Q);
	        }
	        return g;
	      }
	      function bI(A, I, g) {
	        if ((g === void 0 && (g = 2147483647), g < 2)) return 0;
	        g -= 2;
	        for (
	          var B = I, Q = g < A.length * 2 ? g / 2 : A.length, i = 0;
	          i < Q;
	          ++i
	        ) {
	          var n = A.charCodeAt(i);
	          ((z[I >> 1] = n), (I += 2));
	        }
	        return ((z[I >> 1] = 0), I - B);
	      }
	      function WI(A) {
	        return A.length * 2;
	      }
	      function TI(A, I) {
	        for (var g = 0, B = ""; !(g >= I / 4); ) {
	          var Q = j[(A + g * 4) >> 2];
	          if (Q == 0) break;
	          if ((++g, Q >= 65536)) {
	            var i = Q - 65536;
	            B += String.fromCharCode(55296 | (i >> 10), 56320 | (i & 1023));
	          } else B += String.fromCharCode(Q);
	        }
	        return B;
	      }
	      function XI(A, I, g) {
	        if ((g === void 0 && (g = 2147483647), g < 4)) return 0;
	        for (var B = I, Q = B + g - 4, i = 0; i < A.length; ++i) {
	          var n = A.charCodeAt(i);
	          if (n >= 55296 && n <= 57343) {
	            var E = A.charCodeAt(++i);
	            n = (65536 + ((n & 1023) << 10)) | (E & 1023);
	          }
	          if (((j[I >> 2] = n), (I += 4), I + 4 > Q)) break;
	        }
	        return ((j[I >> 2] = 0), I - B);
	      }
	      function ZI(A) {
	        for (var I = 0, g = 0; g < A.length; ++g) {
	          var B = A.charCodeAt(g);
	          (B >= 55296 && B <= 57343 && ++g, (I += 4));
	        }
	        return I;
	      }
	      function qI(A, I, g) {
	        g = H(g);
	        var B, Q, i, n, E;
	        (I === 2
	          ? ((B = mI), (Q = bI), (n = WI), (i = () => aA), (E = 1))
	          : I === 4 && ((B = TI), (Q = XI), (n = ZI), (i = () => k), (E = 2)),
	          L(A, {
	            name: g,
	            fromWireType: function (o) {
	              for (
	                var r = k[o >> 2], h = i(), t, F = o + 4, _ = 0;
	                _ <= r;
	                ++_
	              ) {
	                var X = o + 4 + _ * I;
	                if (_ == r || h[X >> E] == 0) {
	                  var BA = X - F,
	                    IA = B(F, BA);
	                  (t === void 0
	                    ? (t = IA)
	                    : ((t += String.fromCharCode(0)), (t += IA)),
	                    (F = X + I));
	                }
	              }
	              return (p(o), t);
	            },
	            toWireType: function (o, r) {
	              typeof r != "string" &&
	                Y("Cannot pass non-string to C++ string type " + g);
	              var h = n(r),
	                t = RA(4 + h + I);
	              return (
	                (k[t >> 2] = h >> E),
	                Q(r, t + 4, h + I),
	                o !== null && o.push(p, t),
	                t
	              );
	            },
	            argPackAdvance: 8,
	            readValueFromPointer: wA,
	            destructorFunction: function (o) {
	              p(o);
	            },
	          }));
	      }
	      function xI(A, I) {
	        ((I = H(I)),
	          L(A, {
	            isVoid: true,
	            name: I,
	            argPackAdvance: 0,
	            fromWireType: function () {},
	            toWireType: function (g, B) {},
	          }));
	      }
	      function NA(A, I) {
	        var g = O[A];
	        return (g === void 0 && Y(I + " has unknown type " + xA(A)), g);
	      }
	      function jI(A, I, g) {
	        ((A = d.toValue(A)), (I = NA(I, "emval::as")));
	        var B = [],
	          Q = d.toHandle(B);
	        return ((k[g >> 2] = Q), I.toWireType(B, A));
	      }
	      function VI(A, I) {
	        for (var g = new Array(A), B = 0; B < A; ++B)
	          g[B] = NA(k[(I + B * T) >> 2], "parameter " + B);
	        return g;
	      }
	      function OI(A, I, g, B) {
	        A = d.toValue(A);
	        for (var Q = VI(I, g), i = new Array(I), n = 0; n < I; ++n) {
	          var E = Q[n];
	          ((i[n] = E.readValueFromPointer(B)), (B += E.argPackAdvance));
	        }
	        var o = A.apply(void 0, i);
	        return d.toHandle(o);
	      }
	      function _I(A, I) {
	        return ((A = d.toValue(A)), (I = d.toValue(I)), d.toHandle(A[I]));
	      }
	      function PI(A) {
	        A > 4 && (M[A].refcount += 1);
	      }
	      function zI(A) {
	        return ((A = d.toValue(A)), typeof A == "number");
	      }
	      var $I = {};
	      function Ag(A) {
	        var I = $I[A];
	        return I === void 0 ? H(A) : I;
	      }
	      function Ig(A) {
	        return d.toHandle(Ag(A));
	      }
	      function gg(A) {
	        var I = d.toValue(A);
	        (XA(I), fA(A));
	      }
	      function Cg(A, I) {
	        A = NA(A, "_emval_take_value");
	        var g = A.readValueFromPointer(I);
	        return d.toHandle(g);
	      }
	      function Bg() {
	        $("");
	      }
	      function Qg(A, I, g) {
	        u.copyWithin(A, I, I + g);
	      }
	      function Eg() {
	        return 2147483648;
	      }
	      function ig(A) {
	        var I = P.buffer;
	        try {
	          return (P.grow((A - I.byteLength + 65535) >>> 16), UA(), 1);
	        } catch {}
	      }
	      function og(A) {
	        var I = u.length;
	        A = A >>> 0;
	        var g = Eg();
	        if (A > g) return false;
	        let B = (o, r) => o + ((r - (o % r)) % r);
	        for (var Q = 1; Q <= 4; Q *= 2) {
	          var i = I * (1 + 0.2 / Q);
	          i = Math.min(i, A + 100663296);
	          var n = Math.min(g, B(Math.max(A, i), 65536)),
	            E = ig(n);
	          if (E) return true;
	        }
	        return false;
	      }
	      (tI(),
	        (bA = C.BindingError = FA(Error, "BindingError")),
	        (WA = C.InternalError = FA(Error, "InternalError")),
	        yI(),
	        (qA = C.UnboundTypeError = FA(Error, "UnboundTypeError")));
	      var rg =
	          typeof atob == "function"
	            ? atob
	            : function (A) {
	                var I =
	                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	                  g = "",
	                  B,
	                  Q,
	                  i,
	                  n,
	                  E,
	                  o,
	                  r,
	                  h = 0;
	                A = A.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	                do
	                  ((n = I.indexOf(A.charAt(h++))),
	                    (E = I.indexOf(A.charAt(h++))),
	                    (o = I.indexOf(A.charAt(h++))),
	                    (r = I.indexOf(A.charAt(h++))),
	                    (B = (n << 2) | (E >> 4)),
	                    (Q = ((E & 15) << 4) | (o >> 2)),
	                    (i = ((o & 3) << 6) | r),
	                    (g = g + String.fromCharCode(B)),
	                    o !== 64 && (g = g + String.fromCharCode(Q)),
	                    r !== 64 && (g = g + String.fromCharCode(i)));
	                while (h < A.length);
	                return g;
	              };
	      function eg(A) {
	        try {
	          for (
	            var I = rg(A), g = new Uint8Array(I.length), B = 0;
	            B < I.length;
	            ++B
	          )
	            g[B] = I.charCodeAt(B);
	          return g;
	        } catch {
	          throw new Error("Converting base64 string to bytes failed.");
	        }
	      }
	      function nA(A) {
	        if (DA(A)) return eg(A.slice(KA.length));
	      }
	      var tg = {
	          a: rI,
	          q: eI,
	          u: sI,
	          t: fI,
	          o: NI,
	          h: JI,
	          d: LI,
	          c: pI,
	          n: vI,
	          l: qI,
	          v: xI,
	          k: jI,
	          w: OI,
	          b: fA,
	          e: _I,
	          g: PI,
	          p: zI,
	          f: Ig,
	          j: gg,
	          i: Cg,
	          m: Bg,
	          s: Qg,
	          r: og,
	        };
	        oI();
	        (C.___wasm_call_ctors = function () {
	          return (C.___wasm_call_ctors = C.asm.y).apply(null, arguments);
	        });
	        var RA = (C._malloc = function () {
	          return (RA = C._malloc = C.asm.z).apply(null, arguments);
	        }),
	        p = (C._free = function () {
	          return (p = C._free = C.asm.A).apply(null, arguments);
	        }),
	        jA = (C.___getTypeName = function () {
	          return (jA = C.___getTypeName = C.asm.C).apply(null, arguments);
	        });
	        (C.__embind_initialize_bindings = function () {
	          return (C.__embind_initialize_bindings = C.asm.D).apply(
	            null,
	            arguments,
	          );
	        });
	        (C.dynCall_ijiii = function () {
	          return (C.dynCall_ijiii = C.asm.E).apply(null, arguments);
	        });
	        var rA;
	      CA = function A() {
	        (rA || VA(), rA || (CA = A));
	      };
	      function VA(A) {
	        if ((V > 0 || ($A(), V > 0))) return;
	        function I() {
	          rA ||
	            ((rA = true),
	            (C.calledRun = true),
	            !w &&
	              (AI(),
	              s(C),
	              C.onRuntimeInitialized && C.onRuntimeInitialized(),
	              II()));
	        }
	        C.setStatus
	          ? (C.setStatus("Running..."),
	            setTimeout(function () {
	              (setTimeout(function () {
	                C.setStatus("");
	              }, 1),
	                I());
	            }, 1))
	          : I();
	      }
	      if (C.preInit)
	        for (
	          typeof C.preInit == "function" && (C.preInit = [C.preInit]);
	          C.preInit.length > 0;

	        )
	          C.preInit.pop()();
	      return (VA(), C.ready);
	    };
	  })(),
	  Gg = YA,
	  GA = new Uint8Array([0, 0, 0, 1]);
	function hg(c) {
	  console.error(c);
	}
	YA.createFile = OA;
	function OA(c = 256) {
	  let D = 0,
	    C = 0,
	    s = new Uint8Array(c);
	  return {
	    contents: function () {
	      return s.slice(0, C);
	    },
	    seek: function (e) {
	      D = e;
	    },
	    write: function (e) {
	      let a = e.byteLength;
	      return (y(D + a), s.set(e, D), (D += a), (C = Math.max(C, D)), a);
	    },
	  };
	  function y(e) {
	    var a = s.length;
	    if (a >= e) return;
	    var v = 1024 * 1024;
	    ((e = Math.max(e, (a * (a < v ? 2 : 1.125)) >>> 0)),
	      a != 0 && (e = Math.max(e, 256)));
	    let m = s;
	    ((s = new Uint8Array(e)), C > 0 && s.set(m.subarray(0, C), 0));
	  }
	}
	YA.isWebCodecsSupported = _A;
	function _A() {
	  return typeof window < "u" && typeof window.VideoEncoder == "function";
	}
	function Fg(c, D = {}) {
	  let {
	    width: C,
	    height: s,
	    groupOfPictures: y = 20,
	    fps: e = 30,
	    fragmentation: a = false,
	    sequential: v = false,
	    hevc: m = false,
	    format: b = "annexb",
	    codec: W = "avc1.4d0034",
	    acceleration: gA,
	    bitrate: f,
	    error: U = hg,
	    encoderOptions: Z = {},
	    flushFrequency: QA = 10,
	  } = D;
	  if (!_A())
	    throw new Error(
	      "MP4 H264 encoding/decoding depends on WebCodecs API which is not supported in this environment",
	    );
	  if (typeof C != "number" || typeof s != "number")
	    throw new Error("Must specify { width, height } options");
	  if (!isFinite(C) || C < 0 || !isFinite(s) || s < 0)
	    throw new Error("{ width, height } options must be positive integers");
	  let q = OA(),
	    EA = c.create_muxer(
	      { width: C, height: s, fps: e, fragmentation: a, sequential: v, hevc: m },
	      x,
	    ),
	    dA = {
	      codec: W,
	      width: C,
	      height: s,
	      avc: { format: b },
	      hardwareAcceleration: gA,
	      bitrate: f,
	      ...Z,
	    },
	    J = 0,
	    T = new window.VideoEncoder({
	      output(w, N) {
	        P(w, N);
	      },
	      error: U,
	    });
	  return (
	    T.configure(dA),
	    {
	      async end() {
	        return (await T.flush(), T.close(), c.finalize_muxer(EA), q.contents());
	      },
	      async addFrame(w) {
	        let N = (1 / e) * J * 1e6,
	          K = J % y === 0,
	          l = new VideoFrame(w, { timestamp: N });
	        (T.encode(l, { keyFrame: K }),
	          l.close(),
	          QA != null && (J + 1) % QA === 0 && (await T.flush()),
	          J++);
	      },
	      async flush() {
	        return T.flush();
	      },
	    }
	  );
	  function x(w, N, K) {
	    q.seek(K);
	    let l = c.HEAPU8.subarray(w, w + N);
	    return q.write(l) !== l.byteLength;
	  }
	  function lA(w) {
	    let N = c._malloc(w.byteLength);
	    (c.HEAPU8.set(w, N), c.mux_nal(EA, N, w.byteLength), c._free(N));
	  }
	  function P(w, N) {
	    let K = null,
	      l;
	    if (
	      (N &&
	        (N.description && (l = N.description),
	        N.decoderConfig &&
	          N.decoderConfig.description &&
	          (l = N.decoderConfig.description)),
	      l)
	    )
	      try {
	        K = wg(l);
	      } catch (R) {
	        U(R);
	        return;
	      }
	    let G = [];
	    if (
	      (K &&
	        (K.sps_list.forEach((R) => {
	          (G.push(GA), G.push(R));
	        }),
	        K.pps_list.forEach((R) => {
	          (G.push(GA), G.push(R));
	        })),
	      b === "annexb")
	    ) {
	      let R = new Uint8Array(w.byteLength);
	      (w.copyTo(R), G.push(R));
	    } else
	      try {
	        let R = new ArrayBuffer(w.byteLength);
	        (w.copyTo(R),
	          fg(R).forEach((eA) => {
	            (G.push(GA), G.push(eA));
	          }));
	      } catch (R) {
	        U(R);
	        return;
	      }
	    lA(yg(G));
	  }
	}
	function yg(c) {
	  let D = c.reduce((y, e) => y + e.byteLength, 0),
	    C = new Uint8Array(D),
	    s = 0;
	  for (let y = 0; y < c.length; y++) {
	    let e = c[y];
	    (C.set(e, s), (s += e.byteLength));
	  }
	  return C;
	}
	function fg(c) {
	  let C = 0,
	    s = [],
	    y = c.byteLength,
	    e = new Uint8Array(c);
	  for (; C + 4 < y; ) {
	    let a = e[C];
	    if (
	      ((a = (a << 8) + e[C + 1]),
	      (a = (a << 8) + e[C + 2]),
	      (a = (a << 8) + e[C + 3]),
	      s.push(new Uint8Array(c, C + 4, a)),
	      a == 0)
	    )
	      throw new Error("Error: invalid nal_length 0");
	    C += 4 + a;
	  }
	  return s;
	}
	function wg(c) {
	  let D = new DataView(c),
	    C = 0,
	    s = D.getUint8(C++),
	    y = D.getUint8(C++),
	    e = D.getUint8(C++),
	    a = D.getUint8(C++),
	    v = (D.getUint8(C++) & 3) + 1;
	  if (v !== 4) throw new Error("Expected length_size to indicate 4 bytes");
	  let m = D.getUint8(C++) & 31,
	    b = [];
	  for (let f = 0; f < m; f++) {
	    let U = D.getUint16(C, false);
	    C += 2;
	    let Z = new Uint8Array(D.buffer, C, U);
	    (b.push(Z), (C += U));
	  }
	  let W = D.getUint8(C++),
	    gA = [];
	  for (let f = 0; f < W; f++) {
	    let U = D.getUint16(C, false);
	    C += 2;
	    let Z = new Uint8Array(D.buffer, C, U);
	    (gA.push(Z), (C += U));
	  }
	  return {
	    offset: C,
	    version: s,
	    profile: y,
	    compat: e,
	    level: a,
	    length_size: v,
	    pps_list: gA,
	    sps_list: b,
	    numSPS: m,
	  };
	}

	/**
	 * @typedef {object} MP4WasmEncoderOptions
	 * @property {number} [groupOfPictures=20]
	 * @property {number} [flushFrequency=10]
	 * @property {MP4WasmEncoderEncoderOptions} [encoderOptions={}]
	 */
	/**
	 * @typedef {VideoEncoderConfig} MP4WasmEncoderEncoderOptions
	 * @see [VideoEncoder.configure]{@link https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/configure#config}
	 */

	let mp4wasm;

	class MP4WasmEncoder extends Encoder {
	  static supportedExtensions = ["mp4"];
	  static supportedTargets = ["in-browser"];

	  static defaultOptions = {
	    extension: MP4WasmEncoder.supportedExtensions[0],
	    groupOfPictures: 20,
	    flushFrequency: 10,
	  };

	  get frameMethod() {
	    return "bitmap";
	  }

	  /**
	   * @param {MP4WasmEncoderOptions} [options]
	   */
	  constructor(options) {
	    super({ ...MP4WasmEncoder.defaultOptions, ...options });
	  }

	  async init(options) {
	    super.init(options);

	    mp4wasm ||= await Gg(); // { wasmBinary }

	    this.encoder = mp4wasm.createWebCodecsEncoder({
	      // codec: "avc1.420034", // Baseline 4.2
	      codec: "avc1.4d0034", // Main 5.2
	      width: this.width,
	      height: this.height,
	      fps: this.frameRate,
	      encoderOptions: {
	        framerate: this.frameRate,
	        bitrate: estimateBitRate(
	          this.width,
	          this.height,
	          this.frameRate,
	          this.encoderOptions.bitrateMode,
	        ),
	        ...this.encoderOptions,
	      },
	    });
	  }

	  async encode(frame) {
	    await this.encoder.addFrame(frame);
	  }

	  async stop() {
	    let buffer = await this.encoder.end();

	    return buffer;
	  }

	  async dispose() {
	    this.encoder = null;
	  }
	}

	const getFrameName = (frame) => `${String(frame).padStart(5, "0")}.png`;

	/**
	 * @typedef {object} FFmpegEncoderOptions
	 * @property {FFmpegEncoderEncoderOptions} [encoderOptions={}]
	 */
	/**
	 * @typedef {import("@ffmpeg/ffmpeg/dist/esm/types.js").FFMessageLoadConfig} FFmpegEncoderEncoderOptions
	 * @see [FFmpeg#load]{@link https://ffmpegwasm.netlify.app/docs/api/ffmpeg/classes/FFmpeg#load}
	 */

	class FFmpegEncoder extends Encoder {
	  static supportedExtensions = ["mp4", "webm"];

	  /**
	   * @param {FFmpegEncoderOptions} [options]
	   */
	  constructor(options) {
	    super(options);
	  }

	  async init(options) {
	    super.init(options);

	    this.encoder = new ffmpeg.FFmpeg();
	    this.encoder.on("log", ({ message }) => {
	      console.log(message);
	    });

	    await this.encoder.load({ ...this.encoderOptions });

	    this.frameCount = 0;
	  }

	  async encode(frame, frameNumber) {
	    await this.encoder.writeFile(
	      getFrameName(frameNumber),
	      await util.fetchFile(frame),
	    );
	    this.frameCount++;
	  }

	  async stop() {
	    const outputFilename = `output.${this.extension}`;
	    const codec = this.extension === "mp4" ? "libx264" : "libvpx";

	    await this.encoder.exec(
	      `-framerate ${this.frameRate} -pattern_type glob -i *.png -s ${this.width}x${this.height} -pix_fmt yuv420p -c:v ${codec} ${outputFilename}`.split(
	        " ",
	      ),
	    );

	    const data = await this.encoder.readFile(outputFilename);

	    for (let i = 0; i < this.frameCount; i++) {
	      try {
	        this.encoder.deleteFile(getFrameName(i));
	      } catch (error) {
	        console.error(error);
	      }
	    }

	    try {
	      this.encoder.deleteFile(outputFilename);
	    } catch (error) {
	      console.error(error);
	    }

	    return data;
	  }

	  async dispose() {
	    await this.encoder.terminate();
	    this.encoder = null;
	  }
	}

	/**
	 * @typedef {object} MediaCaptureEncoderOptions
	 * @property {number} [flushFrequency=10]
	 * @property {MediaCaptureEncoderEncoderOptions} [encoderOptions={}]
	 */

	/**
	 * @typedef {MediaRecorderOptions} MediaCaptureEncoderEncoderOptions
	 * @see [MediaRecorder#options]{@link https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder#options}
	 */

	class MediaCaptureEncoder extends Encoder {
	  static supportedExtensions = ["mkv", "webm"];

	  static defaultOptions = {
	    extension: MediaCaptureEncoder.supportedExtensions[0],
	    frameMethod: "requestFrame",
	    flushFrequency: 10,
	  };

	  /**
	   * @param {MediaCaptureEncoderOptions} [options]
	   */
	  constructor(options) {
	    super({ ...MediaCaptureEncoder.defaultOptions, ...options });
	  }

	  async init(options) {
	    super.init(options);

	    this.chunks = [];
	    // Forces the use of requestFrame. Use canvas-record v3 for real-time capture.
	    this.stream = this.canvas.captureStream(this.frameRate);

	    this.recorder = new MediaRecorder(this.stream, {
	      mimeType: this.mimeType, // "video/x-matroska;codecs=avc1",
	      // audioBitsPerSecond: 128000, // 128 Kbit/sec
	      // videoBitsPerSecond: 2500000, // 2.5 Mbit/sec
	      ...this.encoderOptions,
	    });
	    this.recorder.ondataavailable = (event) => {
	      event.data.size && this.chunks.push(event.data);

	      if (this.q) this.q.resolve();
	    };
	  }

	  async encode(frame, number) {
	    if (this.recorder.state !== "recording") {
	      this.chunks = [];
	      this.recorder.start();
	    }
	    if (!this.frameRate !== 0) {
	      (this.stream.getVideoTracks?.()?.[0] || this.stream).requestFrame();
	    }
	    if (this.flushFrequency && (number + 1) % this.flushFrequency === 0) {
	      this.recorder.requestData();
	    }
	  }

	  async stop() {
	    this.q = new Deferred();

	    this.recorder.stop();
	    await this.q.promise;

	    delete this.q;

	    return this.chunks;
	  }

	  async dispose() {
	    this.recorder = null;
	    this.stream = null;
	  }
	}

	var index = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Encoder: Encoder,
		FFmpegEncoder: FFmpegEncoder,
		FrameEncoder: FrameEncoder,
		GIFEncoder: GIFEncoder,
		H264MP4Encoder: H264MP4Encoder,
		MP4WasmEncoder: MP4WasmEncoder,
		MediaCaptureEncoder: MediaCaptureEncoder,
		WebCodecsEncoder: WebCodecsEncoder
	});

	exports.Deferred = Deferred;
	exports.Encoders = index;
	exports.Recorder = Recorder;
	exports.RecorderStatus = RecorderStatus;
	exports.captureCanvasRegion = captureCanvasRegion;
	exports.downloadBlob = downloadBlob;
	exports.estimateBitRate = estimateBitRate;
	exports.formatDate = formatDate;
	exports.formatSeconds = formatSeconds;
	exports.isWebCodecsSupported = isWebCodecsSupported;
	exports.nextMultiple = nextMultiple;

	return exports;

})({}, H264MP4Encoder, gifenc, ffmpeg, util);
