/**
 * Kinetic Typography App
 * Main application entry point
 */

import { isWebGLAvailable, getWebGLErrorMessage } from './utils/webgl-check.js';
import SceneManager from './core/scene.js';
import RenderLoop from './core/renderer.js';
import effectManager from './core/effect-manager.js';
import presetManager from './core/preset-manager.js';
import state from './core/state.js';
import appSettings from './core/app-settings.js';
import notification from './ui/notification.js';
import ICONS from './ui/icons.js';

// Import effects
import EndlessEffect from './effects/endless.js';

class App {
    constructor() {
        // Check WebGL support
        if (!isWebGLAvailable()) {
            document.body.innerHTML = getWebGLErrorMessage();
            return;
        }

        this.sceneManager = null;
        this.renderLoop = null;
        this.currentEffect = null;

        this.init();
    }

    async init() {
        // App version and build info
        const appVersion = '2.2.0';
        const buildCommit = 'pending';
        const buildDate = '2025-11-19';

        console.log(`
╔════════════════════════════════════════╗
║   TT K1n3t1c Motion Design             ║
║   Version: ${appVersion}                      ║
║   Build: ${buildCommit}                   ║
║   Date: ${buildDate}                ║
╚════════════════════════════════════════╝
        `);

        // Clear old localStorage if needed (one-time migration)
        const storedVersion = localStorage.getItem('appVersion');
        if (storedVersion !== appVersion) {
            console.log('🔄 Clearing old cache and localStorage...');
            localStorage.clear();
            localStorage.setItem('appVersion', appVersion);
            // Clear service worker cache
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                });
            }
        }

        // Register effects
        this.registerEffects();

        // Initialize scene
        const container = document.getElementById('webgl-container');
        this.sceneManager = new SceneManager(container);

        // Initialize render loop
        this.renderLoop = new RenderLoop(this.sceneManager);

        // Setup UI
        this.setupUI();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Setup event listeners
        this.setupEventListeners();

        // Load initial effect
        const initialEffectId = state.get('activeEffectId') || 'endless';
        this.loadEffect(initialEffectId);

        // Start render loop
        this.renderLoop.start();

        // Configure Coloris color picker (delayed to ensure DOM is ready)
        setTimeout(() => {
            this.initializeColoris();
        }, 100);

        // Show welcome notification
        notification.success('App loaded successfully! Press H for help.');

        console.log('✓ App initialized');
    }

    /**
     * Register all effects
     */
    registerEffects() {
        effectManager.register(EndlessEffect);
        // More effects will be added here
    }

    /**
     * Load effect by ID
     */
    loadEffect(effectId) {
        try {
            // Check if effect exists, fallback to 'endless' if not
            const availableEffects = effectManager.getAll();
            const effectExists = availableEffects.some(e => e.id === effectId);

            if (!effectExists) {
                console.warn(`Effect "${effectId}" not found, falling back to "endless"`);
                effectId = 'endless';
            }

            // Create effect instance
            const effect = effectManager.create(effectId);
            if (!effect) {
                throw new Error(`Failed to create effect: ${effectId}`);
            }

            // Set effect in scene
            this.sceneManager.setEffect(effect);
            this.currentEffect = effect;

            // Update state
            state.set('activeEffectId', effectId);

            // Update UI
            this.updateEffectSelector(effectId);
            this.updateSettingsPanel(effect);

            console.log(`✓ Effect loaded: ${effectId}`);
        } catch (error) {
            console.error('Error loading effect:', error);
            notification.error(`Failed to load effect: ${error.message}`);
        }
    }

    /**
     * Setup UI components
     */
    setupUI() {
        // Populate effect selector
        const effectSelector = document.getElementById('effect-selector');
        const effects = effectManager.getAll();

        effectSelector.innerHTML = '';
        effects.forEach(effect => {
            const option = document.createElement('option');
            option.value = effect.id;
            option.textContent = `${effect.icon} ${effect.name}`;
            effectSelector.appendChild(option);
        });

        // Effect selector change
        effectSelector.addEventListener('change', (e) => {
            this.loadEffect(e.target.value);
        });

        // Help button
        document.getElementById('help-btn').addEventListener('click', () => {
            this.toggleHelp();
        });

        // UI toggle button
        document.getElementById('ui-toggle-btn').addEventListener('click', () => {
            this.toggleUI();
        });

        // Save preset button
        document.getElementById('save-preset-btn').addEventListener('click', () => {
            this.savePreset();
        });

        // Toggle controls panel button (bottom)
        const toggleControlsBtn = document.getElementById('toggle-controls-btn');
        if (toggleControlsBtn) {
            toggleControlsBtn.addEventListener('click', () => {
                this.toggleControlsPanel();
            });
        }

        // Reset settings button
        document.getElementById('reset-settings-btn').addEventListener('click', () => {
            this.resetSettings();
        });

        // Export settings button
        document.getElementById('export-settings-btn').addEventListener('click', () => {
            this.exportSettings();
        });

        // Import preset button
        document.getElementById('import-preset-btn').addEventListener('click', () => {
            this.importPreset();
        });

        // Preset selector
        const presetSelector = document.getElementById('preset-selector');
        if (presetSelector) {
            presetSelector.addEventListener('change', (e) => {
                this.loadPreset(e.target.value);
            });
        }

        // Update preset selector with saved presets
        this.updatePresetSelector();

        // Camera controls
        this.setupCameraControls();

        // Playback controls
        this.setupPlaybackControls();

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.toggleSettings();
        });

        // Settings overlay close
        document.getElementById('close-settings-btn').addEventListener('click', () => {
            this.toggleSettings();
        });

        // Click outside settings to close
        document.getElementById('settings-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'settings-overlay') {
                this.toggleSettings();
            }
        });

        // Save app settings button
        document.getElementById('save-app-settings-btn').addEventListener('click', () => {
            this.saveAppSettings();
        });

        // Export app settings button
        document.getElementById('export-app-settings-btn').addEventListener('click', () => {
            this.exportAppSettings();
        });

        // Import app settings button
        document.getElementById('import-app-settings-btn').addEventListener('click', () => {
            this.importAppSettings();
        });

        // Help overlay close
        document.getElementById('close-help-btn').addEventListener('click', () => {
            this.toggleHelp();
        });

        // Click outside help to close
        document.getElementById('help-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'help-overlay') {
                this.toggleHelp();
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.toggleUI();
                    break;
                case 'g':
                    e.preventDefault();
                    this.toggleSettings();
                    break;
                case 'h':
                    e.preventDefault();
                    this.toggleHelp();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFPS();
                    break;
                case 'r':
                    e.preventDefault();
                    this.resetSettings();
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.savePreset();
                    }
                    break;
                case 'e':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.exportSettings();
                    }
                    break;
                case 'i':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.importPreset();
                    }
                    break;
                case 'escape':
                    this.closeOverlays();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    const effects = effectManager.getAll();
                    const index = parseInt(e.key) - 1;
                    if (effects[index]) {
                        this.loadEffect(effects[index].id);
                    }
                    break;
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            document.getElementById('offline-indicator').style.display = 'none';
            notification.success('Back online', 2000);
        });

        window.addEventListener('offline', () => {
            document.getElementById('offline-indicator').style.display = 'block';
            notification.info('Offline mode active', 3000);
        });

        // Storage error handler
        window.addEventListener('storage-quota-exceeded', () => {
            notification.error('Storage full! Export presets to free up space.', 0);
        });

        // Initialize offline indicator
        if (!navigator.onLine) {
            document.getElementById('offline-indicator').style.display = 'block';
        }
    }

    /**
     * Update effect selector
     */
    updateEffectSelector(effectId) {
        const selector = document.getElementById('effect-selector');
        selector.value = effectId;
    }

    /**
     * Update settings panel with effect controls
     */
    updateSettingsPanel(effect) {
        const settingsContent = document.getElementById('settings-content');
        if (!settingsContent) {
            console.error('❌ Settings content element not found!');
            return;
        }

        settingsContent.innerHTML = '';

        const schema = effect.getSettingsSchema();
        const settings = effect.settings;

        console.log('✓ Updating settings panel, schema keys:', Object.keys(schema).length);

        // Group settings (order matters for display)
        // Note: animationSpeed removed - controlled via Playback Controls panel instead
        const groups = {
            'Typography': ['text', 'fontFamily', 'fontSize', 'letterSpacing', 'repeats'],
            'Colors': ['textColor', 'surfaceColor', 'backgroundColor', 'fogColor']
        };

        Object.entries(groups).forEach(([groupName, keys]) => {
            const group = this.createControlGroup(groupName, keys, schema, settings, effect);
            if (group && group.children.length > 1) {
                settingsContent.appendChild(group);
                console.log(`✓ Added ${groupName} group`);
            }
        });

        console.log('✓ Settings panel updated, total groups:', settingsContent.children.length);
    }

    /**
     * Create control group
     */
    createControlGroup(groupName, keys, schema, settings, effect) {
        const group = document.createElement('div');
        group.className = 'control-group';

        const header = document.createElement('div');
        header.className = 'control-group-header';
        header.innerHTML = `
            <h4 class="control-group-title">${groupName}</h4>
            <span class="control-group-toggle">${ICONS.caretDown}</span>
        `;
        group.appendChild(header);

        const content = document.createElement('div');
        content.className = 'control-group-content';

        keys.forEach(key => {
            if (!schema[key]) return;

            const control = this.createControl(key, schema[key], settings[key], (value) => {
                effect.updateSetting(key, value);
                state.set('currentSettings', effect.settings);
            });

            content.appendChild(control);
        });

        group.appendChild(content);

        // Toggle functionality
        header.addEventListener('click', () => {
            group.classList.toggle('collapsed');
        });

        return group;
    }

    /**
     * Create individual control
     */
    createControl(key, config, value, onChange) {
        const item = document.createElement('div');
        item.className = 'control-item';

        const label = document.createElement('label');
        label.className = 'control-label';
        label.innerHTML = `
            <span>${config.label}</span>
            <button class="control-reset" data-key="${key}" title="Reset to default">↻</button>
        `;
        item.appendChild(label);

        // Create input based on type
        let input;
        switch (config.type) {
            case 'string':
                input = this.createTextInput(value, onChange);
                break;
            case 'number':
                input = this.createSliderInput(value, config, onChange);
                break;
            case 'color':
                input = this.createColorInput(value, onChange);
                break;
            case 'font':
                input = this.createFontSelect(value, onChange);
                break;
            case 'boolean':
                input = this.createCheckboxInput(value, onChange);
                break;
            default:
                input = this.createTextInput(value, onChange);
        }

        item.appendChild(input);

        // Reset button
        item.querySelector('.control-reset').addEventListener('click', () => {
            onChange(config.default);
            // Update input value
            this.updateSettingsPanel(this.currentEffect);
        });

        return item;
    }

    /**
     * Create text input
     */
    createTextInput(value, onChange) {
        const container = document.createElement('div');
        container.className = 'control-text-input';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.addEventListener('input', (e) => {
            onChange(e.target.value);
        });

        container.appendChild(input);
        return container;
    }

    /**
     * Create slider input
     */
    createSliderInput(value, config, onChange) {
        const container = document.createElement('div');
        container.className = 'control-slider';

        const inputs = document.createElement('div');
        inputs.className = 'slider-inputs';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = config.min || 0;
        slider.max = config.max || 100;
        slider.step = config.step || 1;
        slider.value = value;

        const number = document.createElement('input');
        number.type = 'number';
        number.min = config.min || 0;
        number.max = config.max || 100;
        number.step = config.step || 1;
        number.value = value;

        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            number.value = val;
            onChange(val);
        });

        number.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            slider.value = val;
            onChange(val);
        });

        inputs.appendChild(slider);
        inputs.appendChild(number);
        container.appendChild(inputs);

        return container;
    }

    /**
     * Create color input with Coloris picker and eyedropper
     */
    createColorInput(value, onChange) {
        const container = document.createElement('div');
        container.className = 'control-color';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'coloris'; // Coloris will auto-attach to this
        input.value = value;
        input.dataset.coloris = ''; // Enable Coloris on this input

        // Eyedropper button (if browser supports it)
        let eyedropperBtn = null;
        if (window.EyeDropper) {
            eyedropperBtn = document.createElement('button');
            eyedropperBtn.className = 'btn-eyedropper';
            eyedropperBtn.innerHTML = ICONS.eyedropper;
            eyedropperBtn.title = 'Pick color from screen';
            eyedropperBtn.type = 'button';

            eyedropperBtn.addEventListener('click', async () => {
                try {
                    const eyeDropper = new EyeDropper();
                    const result = await eyeDropper.open();
                    const color = result.sRGBHex;

                    input.value = color;
                    onChange(color);

                    // Trigger Coloris update
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                } catch (err) {
                    // User cancelled or error occurred
                    console.log('Eyedropper cancelled or failed:', err);
                }
            });
        }

        // Coloris change event
        input.addEventListener('change', (e) => {
            const color = e.target.value;
            onChange(color);
        });

        // Manual text input (for typing HEX values)
        input.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                onChange(color);
            }
        });

        container.appendChild(input);
        if (eyedropperBtn) {
            container.appendChild(eyedropperBtn);
        }

        return container;
    }

    /**
     * Create font select
     */
    createFontSelect(value, onChange) {
        const container = document.createElement('div');
        container.className = 'control-font';

        const select = document.createElement('select');
        select.className = 'font-select';

        const fonts = [
            'Arial Black',
            'Impact',
            'Helvetica',
            'Courier New',
            'Georgia',
            'Times New Roman',
            'Verdana',
            'Comic Sans MS'
        ];

        fonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            option.style.fontFamily = font;
            if (font === value) option.selected = true;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            onChange(e.target.value);
        });

        container.appendChild(select);
        return container;
    }

    /**
     * Create checkbox input
     */
    createCheckboxInput(value, onChange) {
        const container = document.createElement('div');
        container.className = 'control-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = value;
        checkbox.id = `checkbox-${Math.random().toString(36).substr(2, 9)}`;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = value ? 'Enabled' : 'Disabled';

        checkbox.addEventListener('change', (e) => {
            const checked = e.target.checked;
            label.textContent = checked ? 'Enabled' : 'Disabled';
            onChange(checked);
        });

        container.appendChild(checkbox);
        container.appendChild(label);
        return container;
    }

    /**
     * Toggle UI visibility
     */
    toggleUI() {
        const app = document.getElementById('app');
        app.classList.toggle('ui-hidden');
        const hidden = app.classList.contains('ui-hidden');
        state.set('uiHidden', hidden);
    }

    /**
     * Toggle help overlay
     */
    toggleHelp() {
        const overlay = document.getElementById('help-overlay');
        if (overlay.style.display === 'none' || !overlay.style.display) {
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    }

    /**
     * Toggle FPS counter
     */
    toggleFPS() {
        const show = !state.get('showFPS');
        state.set('showFPS', show);
    }

    /**
     * Toggle settings panel
     */
    toggleSettingsPanel() {
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('collapsed');
        state.set('settingsPanelCollapsed', panel.classList.contains('collapsed'));
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        if (!this.currentEffect) return;

        const schema = this.currentEffect.getSettingsSchema();
        const defaults = {};
        Object.entries(schema).forEach(([key, config]) => {
            defaults[key] = config.default;
        });

        this.currentEffect.updateSettings(defaults);
        this.updateSettingsPanel(this.currentEffect);
        notification.success('Settings reset to defaults');
    }

    /**
     * Save current settings as preset
     */
    savePreset() {
        if (!this.currentEffect) return;

        const name = prompt('Enter preset name:', 'My Preset');
        if (!name) return;

        const preset = presetManager.create({
            name,
            effectId: state.get('activeEffectId'),
            icon: this.currentEffect.constructor.metadata.icon,
            settings: this.currentEffect.settings
        });

        notification.success(`Preset "${name}" saved!`);
        console.log('Preset saved:', preset);

        // Update preset selector to show new preset
        this.updatePresetSelector();
    }

    /**
     * Load preset by ID
     */
    loadPreset(presetId) {
        if (!presetId) return;

        const preset = presetManager.get(presetId);
        if (!preset) {
            notification.error('Preset not found');
            return;
        }

        // Load effect if different
        if (preset.effectId !== state.get('activeEffectId')) {
            this.loadEffect(preset.effectId);
        }

        // Apply preset settings
        if (this.currentEffect) {
            this.currentEffect.updateSettings(preset.settings);
            this.updateSettingsPanel(this.currentEffect);
            notification.success(`Loaded preset: ${preset.name}`);
        }
    }

    /**
     * Update preset selector dropdown
     */
    updatePresetSelector() {
        const selector = document.getElementById('preset-selector');
        if (!selector) return;

        const presets = presetManager.getAll();

        // Clear existing options
        selector.innerHTML = '<option value="">No preset selected</option>';

        // Add preset options
        presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = `${preset.icon} ${preset.name}`;
            selector.appendChild(option);
        });

        console.log(`✓ Preset selector updated with ${presets.length} presets`);
    }

    /**
     * Export settings as JSON
     */
    exportSettings() {
        if (!this.currentEffect) return;

        const data = {
            version: '1.0.0',
            exportedAt: Date.now(),
            effectId: state.get('activeEffectId'),
            effectName: this.currentEffect.constructor.metadata.name,
            settings: this.currentEffect.settings
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `kinetic-typo-${data.effectName}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        notification.success('Settings exported!');
    }

    /**
     * Import preset from file
     */
    importPreset() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // Validate
                if (!data.effectId || !data.settings) {
                    throw new Error('Invalid preset file');
                }

                // Load effect if different
                if (data.effectId !== state.get('activeEffectId')) {
                    this.loadEffect(data.effectId);
                }

                // Apply settings
                this.currentEffect.updateSettings(data.settings);
                this.updateSettingsPanel(this.currentEffect);

                notification.success('Settings imported successfully!');
            } catch (error) {
                notification.error(`Failed to import: ${error.message}`);
            }
        });

        input.click();
    }

    /**
     * Setup camera controls
     */
    setupCameraControls() {
        const zoomSlider = document.getElementById('camera-zoom');
        const panXSlider = document.getElementById('camera-pan-x');
        const panYSlider = document.getElementById('camera-pan-y');
        const rotateXSlider = document.getElementById('camera-rotate-x');
        const rotateYSlider = document.getElementById('camera-rotate-y');
        const resetBtn = document.getElementById('camera-reset-btn');

        if (!zoomSlider || !this.sceneManager.controls) return;

        // Zoom
        zoomSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.sceneManager.camera.position.z = value;
            document.getElementById('camera-zoom-value').textContent = value;
        });

        // Pan X
        panXSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.sceneManager.controls.target.x = value;
            document.getElementById('camera-pan-x-value').textContent = value;
        });

        // Pan Y
        panYSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.sceneManager.controls.target.y = value;
            document.getElementById('camera-pan-y-value').textContent = value;
        });

        // Rotate X
        rotateXSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            const radians = (value * Math.PI) / 180;
            if (this.currentEffect && this.currentEffect.mesh) {
                this.currentEffect.mesh.rotation.x = radians;
            }
            document.getElementById('camera-rotate-x-value').textContent = value + '°';
        });

        // Rotate Y
        rotateYSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            const radians = (value * Math.PI) / 180;
            if (this.currentEffect && this.currentEffect.mesh) {
                this.currentEffect.mesh.rotation.y = radians;
            }
            document.getElementById('camera-rotate-y-value').textContent = value + '°';
        });

        // Reset camera
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.sceneManager.camera.position.set(0, 0, 50);
                this.sceneManager.controls.target.set(0, 0, 0);

                if (this.currentEffect && this.currentEffect.mesh) {
                    this.currentEffect.mesh.rotation.set(0, 0, 0);
                }

                zoomSlider.value = 50;
                panXSlider.value = 0;
                panYSlider.value = 0;
                rotateXSlider.value = 0;
                rotateYSlider.value = 0;

                document.getElementById('camera-zoom-value').textContent = '50';
                document.getElementById('camera-pan-x-value').textContent = '0';
                document.getElementById('camera-pan-y-value').textContent = '0';
                document.getElementById('camera-rotate-x-value').textContent = '0°';
                document.getElementById('camera-rotate-y-value').textContent = '0°';

                notification.success('Camera reset');
            });
        }
    }

    /**
     * Setup playback controls
     */
    setupPlaybackControls() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const speedSlider = document.getElementById('speed-slider');

        if (!playPauseBtn) return;

        let isPaused = false;

        playPauseBtn.addEventListener('click', () => {
            isPaused = !isPaused;

            if (isPaused) {
                this.renderLoop.stop();
                playPauseBtn.innerHTML = `${ICONS.play} Play`;
                playPauseBtn.classList.add('active');
            } else {
                this.renderLoop.start();
                playPauseBtn.innerHTML = `${ICONS.pause} Pause`;
                playPauseBtn.classList.remove('active');
            }
        });

        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                document.getElementById('speed-value').textContent = speed.toFixed(1) + 'x';

                if (this.currentEffect && this.currentEffect.settings) {
                    // Update animation speed if effect has this setting
                    if ('animationSpeed' in this.currentEffect.settings) {
                        this.currentEffect.updateSetting('animationSpeed', speed);
                    }
                }
            });
        }
    }

    /**
     * Toggle controls panel
     */
    toggleControlsPanel() {
        const panel = document.getElementById('controls-panel');
        if (panel) {
            panel.classList.toggle('collapsed');
        }
    }

    /**
     * Toggle settings panel (legacy - now just collapses controls)
     */
    toggleSettingsPanel() {
        this.toggleControlsPanel();
    }

    /**
     * Initialize Coloris with app settings
     */
    initializeColoris() {
        try {
            if (!window.Coloris) {
                console.warn('⚠️ Coloris not loaded');
                return;
            }

            const swatches = appSettings.getColorSwatches();

            Coloris({
                theme: 'pill',
                themeMode: 'dark',
                alpha: false,
                format: 'hex',
                swatches: swatches,
                clearButton: {
                    show: false
                },
                closeButton: true,
                closeLabel: 'Close',
                selectInput: true,
                focusInput: false
            });
            console.log('✓ Coloris initialized with custom swatches');
        } catch (err) {
            console.warn('⚠️ Coloris initialization failed:', err);
        }
    }

    /**
     * Toggle settings overlay
     */
    toggleSettings() {
        const overlay = document.getElementById('settings-overlay');
        if (!overlay) return;

        if (overlay.style.display === 'none' || !overlay.style.display) {
            overlay.style.display = 'flex';
            this.renderColorSwatchesGrid();
        } else {
            overlay.style.display = 'none';
        }
    }

    /**
     * Render color swatches grid
     */
    renderColorSwatchesGrid() {
        const grid = document.getElementById('color-swatches-grid');
        if (!grid) return;

        const swatches = appSettings.getColorSwatches();
        grid.innerHTML = '';

        swatches.forEach((color, index) => {
            const item = document.createElement('div');
            item.className = 'color-swatch-item';

            const preview = document.createElement('div');
            preview.className = 'color-swatch-preview';
            preview.style.backgroundColor = color;
            preview.title = `Click to change color ${index + 1}`;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'color-swatch-input coloris';
            input.value = color;
            input.dataset.coloris = '';
            input.dataset.swatchIndex = index;

            // Update preview when input changes
            input.addEventListener('change', (e) => {
                const newColor = e.target.value;
                if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                    preview.style.backgroundColor = newColor;
                    appSettings.updateColorSwatch(index, newColor);
                }
            });

            // Click preview to open coloris
            preview.addEventListener('click', () => {
                input.click();
            });

            item.appendChild(preview);
            item.appendChild(input);
            grid.appendChild(item);
        });

        // Re-initialize Coloris for new inputs
        setTimeout(() => this.initializeColoris(), 50);
    }

    /**
     * Save app settings
     */
    saveAppSettings() {
        // Collect all swatch values
        const inputs = document.querySelectorAll('.color-swatch-input');
        const swatches = Array.from(inputs).map(input => input.value);

        if (appSettings.setColorSwatches(swatches)) {
            notification.success('Settings saved!');
            // Re-initialize Coloris with new swatches
            this.initializeColoris();
            this.toggleSettings();
        } else {
            notification.error('Failed to save settings');
        }
    }

    /**
     * Export app settings
     */
    exportAppSettings() {
        const data = appSettings.export();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `tt-kinetic-settings-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        notification.success('Settings exported!');
    }

    /**
     * Import app settings
     */
    importAppSettings() {
        const input = document.getElementById('import-settings-file');
        if (!input) return;

        input.click();
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (appSettings.import(data)) {
                        notification.success('Settings imported!');
                        this.renderColorSwatchesGrid();
                        this.initializeColoris();
                    } else {
                        notification.error('Invalid settings file');
                    }
                } catch (err) {
                    notification.error('Failed to import settings');
                    console.error('Import error:', err);
                }
            };
            reader.readAsText(file);

            // Reset input
            input.value = '';
        };
    }

    /**
     * Close all overlays
     */
    closeOverlays() {
        document.getElementById('help-overlay').style.display = 'none';
        document.getElementById('settings-overlay').style.display = 'none';
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}
