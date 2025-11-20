/**
 * Three.js Scene Manager
 * Sets up and manages the Three.js scene
 */

export class SceneManager {
    constructor(container) {
        this.container = container;
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.clock = null;
        this.activeEffect = null;

        this.init();
    }

    init() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 50); // Position to see complete geometry

        // Scene
        this.scene = new THREE.Scene();

        // Clock
        this.clock = new THREE.Clock();

        // Add canvas to DOM
        this.container.appendChild(this.renderer.domElement);

        // OrbitControls for camera interaction
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.enableRotate = true;
            this.controls.mouseButtons = {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.ROTATE
            };
        } else {
            console.warn('OrbitControls not available');
            this.controls = null;
        }

        // Event listeners
        window.addEventListener('resize', this.resize.bind(this));

        console.log('✓ Three.js scene initialized');
    }

    /**
     * Set active effect
     */
    setEffect(effect) {
        // Clean up old effect
        if (this.activeEffect) {
            this.activeEffect.destroy();
            // Remove all children from scene
            while (this.scene.children.length > 0) {
                this.scene.remove(this.scene.children[0]);
            }
        }

        this.activeEffect = effect;

        if (this.activeEffect) {
            this.activeEffect.init(this.scene, this.camera, this.renderer);
        }
    }

    /**
     * Update loop
     */
    update() {
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        if (this.activeEffect) {
            this.activeEffect.update(deltaTime, elapsedTime);
        }
    }

    /**
     * Render scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     */
    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        if (this.activeEffect) {
            this.activeEffect.resize(width, height);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        window.removeEventListener('resize', this.resize.bind(this));

        if (this.activeEffect) {
            this.activeEffect.destroy();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

export default SceneManager;
