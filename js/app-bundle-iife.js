/**
 * Floss - Motion Design
 * IIFE Bundle for file:// compatibility
 * All modules bundled in correct dependency order
 */

(function(window) {
    'use strict';

    // =====================================================================
    // VERSION
    // =====================================================================
    const VERSION = {
        number: '5.2.0',
        commit: 'feat: Add Wave Plane and Sphere Text effects',
        date: '2025-11-23',
        time: '14:45'
    };

    // =====================================================================
    // UTILS: WebGL Check
    // =====================================================================
    const webglCheck = (function() {
        function isWebGLAvailable() {
            try {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                return !!context;
            } catch (e) {
                return false;
            }
        }

        function getWebGLErrorMessage() {
            return `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    padding: 2rem;
                    text-align: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: #0a0a0a;
                    color: #e5e5e5;
                ">
                    <div style="font-size: 64px; margin-bottom: 1rem;">⚠️</div>
                    <h1 style="font-size: 24px; margin-bottom: 1rem;">WebGL Not Supported</h1>
                    <p style="max-width: 500px; color: #9ca3af; line-height: 1.6;">
                        Your browser doesn't support WebGL, which is required for this application.
                        <br><br>
                        Please use a modern browser like Chrome, Edge, or Safari (latest versions).
                    </p>
                </div>
            `;
        }

        return { isWebGLAvailable, getWebGLErrorMessage };
    })();

    // =====================================================================
    // UTILS: Storage
    // =====================================================================
    const storage = (function() {
        function getItem(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error(`Error reading "${key}" from localStorage:`, error);
                return defaultValue;
            }
        }

        function setItem(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error(`Error writing "${key}" to localStorage:`, error);

                if (error.name === 'QuotaExceededError') {
                    window.dispatchEvent(new CustomEvent('storage-quota-exceeded', {
                        detail: { key, error }
                    }));
                }

                return false;
            }
        }

        function removeItem(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error(`Error removing "${key}" from localStorage:`, error);
                return false;
            }
        }

        function clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }

        function isAvailable() {
            try {
                const test = '__localStorage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (error) {
                return false;
            }
        }

        function getStorageInfo() {
            let totalSize = 0;
            let items = {};

            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const size = localStorage.getItem(key).length;
                    totalSize += size;
                    items[key] = size;
                }
            }

            return {
                totalSize,
                totalSizeKB: (totalSize / 1024).toFixed(2),
                items,
                itemCount: Object.keys(items).length
            };
        }

        return {
            getItem,
            setItem,
            removeItem,
            clear,
            isAvailable,
            getStorageInfo
        };
    })();

    // =====================================================================
    // UTILS: Text Texture
    // =====================================================================
    const textTexture = (function() {
        function createTextTexture(options = {}) {
            const {
                text = 'TEXT',
                fontSize = 120,
                fontFamily = 'Arial Black, sans-serif',
                letterSpacing = 0,
                padding = 20,
                textColor = '#ffffff',
                backgroundColor = '#000000',
                maxWidth = 2048,
                fitToTile = false
            } = options;

            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set font for measurement
            ctx.font = `bold ${fontSize}px ${fontFamily}`;

            // Calculate text metrics with letter spacing
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width + (letterSpacing * (text.length - 1));
            const textHeight = fontSize;

            // Set canvas size (with padding, power of 2 for better performance)
            let width, height, scaleFactor = 1;

            if (fitToTile) {
                // Fixed tile size with padding as inner margin
                width = Math.min(Math.pow(2, Math.ceil(Math.log2(512))), maxWidth);
                height = Math.pow(2, Math.ceil(Math.log2(256)));

                // Calculate scale to fit text within tile bounds (considering padding)
                const availableWidth = width - (padding * 2);
                const availableHeight = height - (padding * 2);
                scaleFactor = Math.min(availableWidth / textWidth, availableHeight / textHeight);
            } else {
                // Natural size with padding
                width = Math.min(
                    Math.pow(2, Math.ceil(Math.log2(textWidth + padding * 2))),
                    maxWidth
                );
                height = Math.pow(2, Math.ceil(Math.log2(textHeight + padding * 2)));
            }

            canvas.width = width;
            canvas.height = height;

            // Fill background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);

            // Apply scale transformation if fitToTile is enabled
            if (fitToTile && scaleFactor !== 1) {
                ctx.save();
                // Center the scaled text
                ctx.translate(width / 2, height / 2);
                ctx.scale(scaleFactor, scaleFactor);
                ctx.translate(-width / 2, -height / 2);
            }

            // Set text style
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';

            // Draw text with letter spacing
            if (letterSpacing === 0) {
                // No letter spacing - simple draw
                ctx.fillText(text, width / 2, height / 2);
            } else {
                // With letter spacing - draw each character
                let x = (width - textWidth) / 2;
                const y = height / 2;

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const charWidth = ctx.measureText(char).width;
                    ctx.fillText(char, x + charWidth / 2, y);
                    x += charWidth + letterSpacing;
                }
            }

            // Restore context if we applied scaling
            if (fitToTile && scaleFactor !== 1) {
                ctx.restore();
            }

            // Create Three.js texture
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            // Fix seamless tiling - prevent gray lines between tiles
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;

            return {
                texture,
                canvas,
                width,
                height,
                aspectRatio: width / height
            };
        }

        function updateTextTexture(textureData, options = {}) {
            const canvas = textureData.canvas;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            const {
                text,
                fontSize = 120,
                fontFamily = 'Arial Black, sans-serif',
                letterSpacing = 0,
                textColor,
                backgroundColor,
                padding = 20,
                fitToTile = false
            } = options;

            // Clear canvas
            ctx.fillStyle = backgroundColor || '#000000';
            ctx.fillRect(0, 0, width, height);

            // Calculate text metrics and scale factor
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width + (letterSpacing * (text.length - 1));
            const textHeight = fontSize;

            let scaleFactor = 1;
            if (fitToTile) {
                const availableWidth = width - (padding * 2);
                const availableHeight = height - (padding * 2);
                scaleFactor = Math.min(availableWidth / textWidth, availableHeight / textHeight);
            }

            // Apply scale transformation if fitToTile is enabled
            if (fitToTile && scaleFactor !== 1) {
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.scale(scaleFactor, scaleFactor);
                ctx.translate(-width / 2, -height / 2);
            }

            // Set text style
            ctx.fillStyle = textColor || '#ffffff';
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';

            // Draw text
            if (letterSpacing === 0) {
                ctx.fillText(text, width / 2, height / 2);
            } else {
                let x = (width - textWidth) / 2;
                const y = height / 2;

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const charWidth = ctx.measureText(char).width;
                    ctx.fillText(char, x + charWidth / 2, y);
                    x += charWidth + letterSpacing;
                }
            }

            // Restore context if we applied scaling
            if (fitToTile && scaleFactor !== 1) {
                ctx.restore();
            }

            // Update texture
            textureData.texture.needsUpdate = true;
        }

        return {
            createTextTexture,
            updateTextTexture
        };
    })();

    // =====================================================================
    // UI: Icons
    // =====================================================================
    const ICONS = {
        question: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>`,
        eye: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/></svg>`,
        arrowClockwise: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"/></svg>`,
        export: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,112v96a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V112A16,16,0,0,1,56,96h40a8,8,0,0,1,0,16H56v96H200V112H160a8,8,0,0,1,0-16h40A16,16,0,0,1,216,112ZM93.66,69.66,120,43.31V136a8,8,0,0,0,16,0V43.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,69.66Z"/></svg>`,
        floppyDisk: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M219.31,80,176,36.69A15.86,15.86,0,0,0,164.69,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V91.31A15.86,15.86,0,0,0,219.31,80ZM168,208H88V152h80Zm40,0H184V152a16,16,0,0,0-16-16H88a16,16,0,0,0-16,16v56H48V48H164.69L208,91.31ZM160,72a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h56A8,8,0,0,1,160,72Z"/></svg>`,
        download: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/></svg>`,
        pause: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"/></svg>`,
        play: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"/></svg>`,
        caretDown: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>`,
        x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>`,
        wifiSlash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M213.92,210.62a8,8,0,1,1-11.84,10.76L179.4,196.69a39.14,39.14,0,0,0-25.95-9.43,40,40,0,0,0-40,40,8,8,0,0,1-16,0,56.06,56.06,0,0,1,56-56,55.11,55.11,0,0,1,30.54,9.11L162.43,155.2A71.84,71.84,0,0,0,128,147.06,72,72,0,0,0,56,219.06a8,8,0,0,1-16,0,88.12,88.12,0,0,1,70.8-86.28l-20-22A103.94,103.94,0,0,0,24,219.06a8,8,0,0,1-16,0,119.94,119.94,0,0,1,94.34-117.39L79.6,76.69A135.93,135.93,0,0,0,8,219.06a8,8,0,0,1-16,0,151.9,151.9,0,0,1,83.6-135.18L42.08,45.38A8,8,0,1,1,53.92,34.62ZM128,40a151.24,151.24,0,0,1,95.6,33.82,8,8,0,1,1-10.09,12.39A135.27,135.27,0,0,0,128,56a136.64,136.64,0,0,0-29.48,3.23,8,8,0,0,1-3.45-15.62A152.65,152.65,0,0,1,128,40Zm0,64a119.31,119.31,0,0,1,75.6,26.82,8,8,0,1,1-10.09,12.38A103.29,103.29,0,0,0,128,120a104.68,104.68,0,0,0-25.15,3.07,8,8,0,0,1-3.9-15.51A120.67,120.67,0,0,1,128,104Zm0,32a87.42,87.42,0,0,1,55.49,19.68,8,8,0,0,1-10.12,12.38A71.53,71.53,0,0,0,128,152Z"/></svg>`,
        gear: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8.06,8.06,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8.06,8.06,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"/></svg>`,
        camera: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"/></svg>`,
        plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/></svg>`,
        trash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/></svg>`,
        eyedropper: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M224,67.3a35.79,35.79,0,0,0-11.26-25.66c-14-13.28-36.72-12.78-50.62,1.13L138.8,66.2a24,24,0,0,0-33.14.77l-5,5a16,16,0,0,0,0,22.64l2.87,2.87L61.07,140a38.4,38.4,0,0,0,0,54.29l5.46,5.46-28.6,28.6a8,8,0,1,0,11.32,11.32l28.59-28.59,5.46,5.46a38.4,38.4,0,0,0,54.29,0l42.55-42.55,2.87,2.87a16,16,0,0,0,22.63,0l5-5a24,24,0,0,0,.74-33.18l23.42-23.42C203,102,223.48,81.59,224,67.3ZM116.69,205a22.42,22.42,0,0,1-31.72,0L66.33,186.4A22.4,22.4,0,0,1,72,159.11L114.36,117l31,31Zm60.57-60.54-50.07-50.06,8.48-8.49a8,8,0,0,1,11.71.25L197.94,137a8,8,0,0,1-.6,11.36ZM205.91,98.1l-19.8,19.8L144.2,76a24,24,0,0,0-33.14-.77l-3.74,3.74L104.44,76A8,8,0,0,1,107.31,64l23.43-23.43c8.75-8.74,23.91-9,31.05-1.8A19.86,19.86,0,0,1,168,52.69C168,63.14,159,79.63,205.91,98.1Z"/></svg>`
    };

    function getIcon(name, attrs = {}) {
        const svg = ICONS[name] || '';
        if (!svg) return '';

        // Parse attributes
        const attrString = Object.entries(attrs)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');

        // If no custom attributes, return as is
        if (!attrString) return svg;

        // Insert attributes into SVG tag
        return svg.replace('<svg ', `<svg ${attrString} `);
    }

    // =====================================================================
    // UI: Notification
    // =====================================================================
    const notification = (function() {
        function showNotification(message, type = 'info', duration = 3000) {
            const container = document.getElementById('notification-container');
            if (!container) return;

            const notification = document.createElement('div');
            notification.className = `notification notification--${type}`;

            // Icon based on type
            let icon = '';
            switch (type) {
                case 'success':
                    icon = '✓';
                    break;
                case 'error':
                    icon = '✕';
                    break;
                case 'warning':
                    icon = '⚠';
                    break;
                default:
                    icon = 'ℹ';
            }

            notification.innerHTML = `
                <span class="notification__icon">${icon}</span>
                <span class="notification__message">${message}</span>
            `;

            container.appendChild(notification);

            // Trigger animation
            setTimeout(() => notification.classList.add('notification--show'), 10);

            // Auto remove
            setTimeout(() => {
                notification.classList.remove('notification--show');
                setTimeout(() => container.removeChild(notification), 300);
            }, duration);
        }

        return showNotification;
    })();

    // =====================================================================
    // NOTE: This is a minimal IIFE bundle!
    // Full implementation requires ALL core, effect, and UI modules
    // This demonstrates the structure - you'll need to add:
    // - Core modules (state, scene, renderer, effect-manager, etc.)
    // - Effect modules (effect-base, endless, glitch, particles, etc.)
    // - UI modules (safe-frame, export-panel, etc.)
    // - Main App class
    // =====================================================================

    // Export minimal API to window
    window.Floss = {
        VERSION,
        webglCheck,
        storage,
        textTexture,
        ICONS,
        getIcon,
        notification
    };

    console.warn('Floss IIFE Bundle: Minimal version loaded. Full implementation pending.');
    console.log('Available:', Object.keys(window.Floss));

})(window);
