/**
 * Text Texture Generator
 * Creates canvas-based text textures for Three.js with emoji support
 */

export function createTextTexture(options = {}) {
    const {
        text = 'TEXT',
        fontSize = 120,
        fontFamily = 'Arial Black, sans-serif',
        letterSpacing = 0,
        padding = 20,
        textColor = '#ffffff',
        backgroundColor = '#000000',
        maxWidth = 2048
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
    const width = Math.min(
        Math.pow(2, Math.ceil(Math.log2(textWidth + padding * 2))),
        maxWidth
    );
    const height = Math.pow(2, Math.ceil(Math.log2(textHeight + padding * 2)));

    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

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

    // Create Three.js texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return {
        texture,
        canvas,
        width,
        height,
        aspectRatio: width / height
    };
}

/**
 * Update existing text texture
 */
export function updateTextTexture(textureData, options = {}) {
    const canvas = textureData.canvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const {
        text,
        fontSize,
        fontFamily,
        letterSpacing = 0,
        textColor,
        backgroundColor
    } = options;

    // Clear canvas
    ctx.fillStyle = backgroundColor || '#000000';
    ctx.fillRect(0, 0, width, height);

    // Set text style
    ctx.fillStyle = textColor || '#ffffff';
    ctx.font = `bold ${fontSize || 120}px ${fontFamily || 'Arial Black, sans-serif'}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Draw text
    if (letterSpacing === 0) {
        ctx.fillText(text, width / 2, height / 2);
    } else {
        const textWidth = ctx.measureText(text).width + (letterSpacing * (text.length - 1));
        let x = (width - textWidth) / 2;
        const y = height / 2;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = ctx.measureText(char).width;
            ctx.fillText(char, x + charWidth / 2, y);
            x += charWidth + letterSpacing;
        }
    }

    // Update texture
    textureData.texture.needsUpdate = true;
}

export default {
    createTextTexture,
    updateTextTexture
};
