/**
 * Simple WebM Muxer
 *
 * Creates WebM video files from encoded video frames (VP8/VP9).
 * Zero dependencies, pure JavaScript EBML writer.
 *
 * Usage:
 *   const muxer = new WebMMuxer({ width, height, frameRate });
 *   muxer.addFrame(encodedChunk, timestamp);
 *   const blob = muxer.finalize();
 */

/**
 * EBML (Extensible Binary Meta Language) utilities
 * WebM is based on Matroska, which uses EBML
 */

// EBML element IDs (Matroska/WebM spec)
const EBML = {
    // Top-level
    EBML: 0x1a45dfa3,
    Segment: 0x18538067,

    // EBML header
    EBMLVersion: 0x4286,
    EBMLReadVersion: 0x42f7,
    EBMLMaxIDLength: 0x42f2,
    EBMLMaxSizeLength: 0x42f3,
    DocType: 0x4282,
    DocTypeVersion: 0x4287,
    DocTypeReadVersion: 0x4285,

    // Segment info
    Info: 0x1549a966,
    TimecodeScale: 0x2ad7b1,
    MuxingApp: 0x4d80,
    WritingApp: 0x5741,
    Duration: 0x4489,

    // Tracks
    Tracks: 0x1654ae6b,
    TrackEntry: 0xae,
    TrackNumber: 0xd7,
    TrackUID: 0x73c5,
    TrackType: 0x83,
    CodecID: 0x86,
    Video: 0xe0,
    PixelWidth: 0xb0,
    PixelHeight: 0xba,

    // Cluster
    Cluster: 0x1f43b675,
    Timecode: 0xe7,
    SimpleBlock: 0xa3,
};

/**
 * Write EBML variable-length integer (vint)
 */
function writeVint(value, bytes = null) {
    // Auto-determine byte length if not specified
    if (bytes === null) {
        if (value < 0x7f) bytes = 1;
        else if (value < 0x3fff) bytes = 2;
        else if (value < 0x1fffff) bytes = 3;
        else if (value < 0xfffffff) bytes = 4;
        else bytes = 8;
    }

    const data = new Uint8Array(bytes);

    // Set marker bit
    data[0] = 1 << (8 - bytes);

    // Write value
    for (let i = bytes - 1; i >= 0; i--) {
        const shift = 8 * (bytes - 1 - i);
        data[i] |= (value >> shift) & 0xff;
    }

    return data;
}

/**
 * Write EBML element ID (variable length)
 */
function writeElementID(id) {
    const bytes = [];
    let temp = id;

    while (temp > 0) {
        bytes.unshift(temp & 0xff);
        temp >>= 8;
    }

    return new Uint8Array(bytes);
}

/**
 * Write EBML element with data
 */
function writeEBMLElement(id, data) {
    const idBytes = writeElementID(id);
    const sizeBytes = writeVint(data.byteLength);

    const result = new Uint8Array(idBytes.length + sizeBytes.length + data.byteLength);
    result.set(idBytes, 0);
    result.set(sizeBytes, idBytes.length);
    result.set(data, idBytes.length + sizeBytes.length);

    return result;
}

/**
 * Write unsigned integer (big-endian)
 */
function writeUInt(value, bytes) {
    const data = new Uint8Array(bytes);
    for (let i = bytes - 1; i >= 0; i--) {
        data[i] = value & 0xff;
        value >>= 8;
    }
    return data;
}

/**
 * Write float64 (big-endian)
 */
function writeFloat64(value) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, value, false); // big-endian
    return new Uint8Array(buffer);
}

/**
 * Write UTF-8 string
 */
function writeString(str) {
    return new TextEncoder().encode(str);
}

/**
 * Concatenate Uint8Arrays
 */
function concat(...arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.byteLength, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.byteLength;
    }
    return result;
}

/**
 * WebM Muxer
 */
export class WebMMuxer {
    constructor(options = {}) {
        this.width = options.width || 1920;
        this.height = options.height || 1080;
        this.frameRate = options.frameRate || 30;
        this.codec = options.codec || 'vp9'; // 'vp8' or 'vp9'

        this.frames = [];
        this.duration = 0;
    }

    /**
     * Add encoded video frame
     * @param {EncodedVideoChunk} chunk - Encoded video chunk from VideoEncoder
     * @param {number} timestamp - Timestamp in milliseconds
     */
    addFrame(chunk, timestamp) {
        // Copy chunk data
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);

        this.frames.push({
            data: data,
            timestamp: timestamp,
            isKeyframe: chunk.type === 'key'
        });

        this.duration = Math.max(this.duration, timestamp);
    }

    /**
     * Finalize and return WebM blob
     */
    finalize() {
        const ebmlHeader = this.createEBMLHeader();
        const segment = this.createSegment();

        const webmData = concat(ebmlHeader, segment);
        return new Blob([webmData], { type: 'video/webm' });
    }

    /**
     * Create EBML header
     */
    createEBMLHeader() {
        const headerElements = concat(
            writeEBMLElement(EBML.EBMLVersion, writeUInt(1, 1)),
            writeEBMLElement(EBML.EBMLReadVersion, writeUInt(1, 1)),
            writeEBMLElement(EBML.EBMLMaxIDLength, writeUInt(4, 1)),
            writeEBMLElement(EBML.EBMLMaxSizeLength, writeUInt(8, 1)),
            writeEBMLElement(EBML.DocType, writeString('webm')),
            writeEBMLElement(EBML.DocTypeVersion, writeUInt(2, 1)),
            writeEBMLElement(EBML.DocTypeReadVersion, writeUInt(2, 1))
        );

        return writeEBMLElement(EBML.EBML, headerElements);
    }

    /**
     * Create Segment (contains Info, Tracks, Clusters)
     */
    createSegment() {
        const info = this.createInfo();
        const tracks = this.createTracks();
        const clusters = this.createClusters();

        const segmentData = concat(info, tracks, ...clusters);

        // Use unknown size (all 1s) for live streaming compatibility
        const segmentID = writeElementID(EBML.Segment);
        const segmentSize = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

        return concat(segmentID, segmentSize, segmentData);
    }

    /**
     * Create Info section (duration, timecode scale, etc.)
     */
    createInfo() {
        const timecodeScale = 1000000; // 1ms = 1000000ns (WebM standard)

        const infoElements = concat(
            writeEBMLElement(EBML.TimecodeScale, writeUInt(timecodeScale, 4)),
            writeEBMLElement(EBML.MuxingApp, writeString('Floss WebM Muxer')),
            writeEBMLElement(EBML.WritingApp, writeString('Floss Video Export')),
            writeEBMLElement(EBML.Duration, writeFloat64(this.duration))
        );

        return writeEBMLElement(EBML.Info, infoElements);
    }

    /**
     * Create Tracks section (video track definition)
     */
    createTracks() {
        const codecID = this.codec === 'vp8' ? 'V_VP8' : 'V_VP9';

        const videoElements = concat(
            writeEBMLElement(EBML.PixelWidth, writeUInt(this.width, 2)),
            writeEBMLElement(EBML.PixelHeight, writeUInt(this.height, 2))
        );

        const trackElements = concat(
            writeEBMLElement(EBML.TrackNumber, writeUInt(1, 1)),
            writeEBMLElement(EBML.TrackUID, writeUInt(1, 1)),
            writeEBMLElement(EBML.TrackType, writeUInt(1, 1)), // 1 = video
            writeEBMLElement(EBML.CodecID, writeString(codecID)),
            writeEBMLElement(EBML.Video, videoElements)
        );

        const track = writeEBMLElement(EBML.TrackEntry, trackElements);
        return writeEBMLElement(EBML.Tracks, track);
    }

    /**
     * Create Clusters (groups of frames)
     * One cluster per second for better seeking
     */
    createClusters() {
        const clusters = [];
        const clusterDuration = 1000; // 1 second per cluster

        let currentCluster = [];
        let clusterTimecode = 0;

        for (const frame of this.frames) {
            // Start new cluster every second
            if (frame.timestamp >= clusterTimecode + clusterDuration && currentCluster.length > 0) {
                clusters.push(this.createCluster(clusterTimecode, currentCluster));
                currentCluster = [];
                clusterTimecode = Math.floor(frame.timestamp / clusterDuration) * clusterDuration;
            }

            currentCluster.push(frame);
        }

        // Add final cluster
        if (currentCluster.length > 0) {
            clusters.push(this.createCluster(clusterTimecode, currentCluster));
        }

        return clusters;
    }

    /**
     * Create single cluster
     */
    createCluster(timecode, frames) {
        const blocks = frames.map(frame => this.createSimpleBlock(frame, timecode));

        const clusterElements = concat(
            writeEBMLElement(EBML.Timecode, writeUInt(timecode, 2)),
            ...blocks
        );

        return writeEBMLElement(EBML.Cluster, clusterElements);
    }

    /**
     * Create SimpleBlock (contains frame data)
     */
    createSimpleBlock(frame, clusterTimecode) {
        const relativeTimecode = frame.timestamp - clusterTimecode;

        // SimpleBlock format:
        // - Track number (vint)
        // - Timecode (int16, signed, relative to cluster)
        // - Flags (uint8)
        // - Frame data

        const trackNumber = writeVint(1, 1); // Track 1
        const timecodeBytes = new Uint8Array(2);
        timecodeBytes[0] = (relativeTimecode >> 8) & 0xff;
        timecodeBytes[1] = relativeTimecode & 0xff;

        // Flags: keyframe (0x80) or not (0x00)
        const flags = new Uint8Array([frame.isKeyframe ? 0x80 : 0x00]);

        const blockData = concat(trackNumber, timecodeBytes, flags, frame.data);

        return writeEBMLElement(EBML.SimpleBlock, blockData);
    }
}

export default WebMMuxer;
