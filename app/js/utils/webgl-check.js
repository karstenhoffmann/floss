/**
 * WebGL Support Detection
 */

export function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!context;
    } catch (e) {
        return false;
    }
}

export function getWebGLErrorMessage() {
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

export default {
    isWebGLAvailable,
    getWebGLErrorMessage
};
