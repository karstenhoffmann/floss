/**
 * Floss - Motion Design
 * Main application entry point
 */

import { isWebGLAvailable, getWebGLErrorMessage } from './utils/webgl-check.js';
import SceneManager from './core/scene.js';
import RenderLoop from './core/renderer.js';
import VideoExportManager from './core/video-export.js';
import effectManager from './core/effect-manager.js';
import presetManager from './core/preset-manager.js';
import state from './core/state.js';
import appSettings from './core/app-settings.js';
import notification from './ui/notification.js';
import ICONS from './ui/icons.js';
import VERSION from './version.js';

// Import effects
import EndlessEffect from './effects/endless.js';
import GlitchEffect from './effects/glitch.js';
import ParticlesEffect from './effects/particles.js';
import WavePlaneEffect from './effects/wave-plane.js';
import SphereTextEffect from './effects/sphere-text.js';

class App {
    constructor() {
        // Check WebGL support
        if (!isWebGLAvailable()) {
            document.body.innerHTML = getWebGLErrorMessage();
            return;
        }

        this.sceneManager = null;
        this.renderLoop = null;
        this.videoExportManager = null;
        this.currentEffect = null;

        this.init();
    }

    async init() {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🎨 Floss - Motion Design                                     ║
║   Version: ${VERSION.number.padEnd(10)} Date: ${VERSION.date} ${VERSION.time}        ║
║   Last Commit: ${VERSION.commit.padEnd(47)}║
╚════════════════════════════════════════════════════════════════╝
        `);

        // Clear old localStorage if needed (one-time migration)
        const storedVersion = localStorage.getItem('appVersion');
        if (storedVersion !== VERSION.number) {
            console.log('🔄 Clearing old cache and localStorage...');
            localStorage.clear();
            localStorage.setItem('appVersion', VERSION.number);
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

        // Initialize video export manager
        this.videoExportManager = new VideoExportManager(this, this.sceneManager);

        // Expose for debugging
        window.app = this;

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
        effectManager.register(GlitchEffect);
        effectManager.register(ParticlesEffect);
        effectManager.register(WavePlaneEffect);
        effectManager.register(SphereTextEffect);
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

        // Camera controls (must be after scene is initialized)
        this.setupCameraControls();

        // Playback controls
        this.setupPlaybackControls();

        // Setup bidirectional camera sync (Mouse → Sidebar)
        this.setupCameraSync();

        // Setup camera settings in App Settings panel
        this.setupCameraSettings();

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
                    // Context-aware spacebar behavior
                    if (state.get('exportMode') !== null) {
                        // In Export Mode: Pan mode (TODO: Implement camera pan)
                        console.log('Export Mode: Pan mode (not yet implemented)');
                    } else {
                        // In Normal Mode: Toggle UI
                        this.toggleUI();
                    }
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
                    e.preventDefault();
                    if (e.ctrlKey || e.metaKey) {
                        // Ctrl+E / Cmd+E: Export settings
                        this.exportSettings();
                    } else {
                        // E alone: Toggle video export mode
                        if (state.get('exportMode') === null) {
                            // Not in export mode → Enter export mode
                            this.videoExportManager.enter();
                        } else {
                            // Already in export mode → Exit export mode
                            this.videoExportManager.exit();
                        }
                    }
                    break;
                case 'i':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.importPreset();
                    }
                    break;
                case 'escape':
                    // Context-aware escape behavior
                    if (state.get('exportMode') !== null) {
                        // In Export Mode: Exit export mode
                        e.preventDefault();
                        this.videoExportManager.exit();
                    } else {
                        // In Normal Mode: Close overlays
                        this.closeOverlays();
                    }
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

        // Dynamically group settings based on 'group' property in schema
        const groupedSettings = {};
        const groupOrder = ['text', 'colors', 'effect', 'animation']; // Display order
        const groupTitles = {
            'text': 'Typography',
            'colors': 'Colors',
            'effect': 'Effect',
            'animation': 'Animation'
        };

        // Organize settings by group, but separate colors
        const colorKeys = [];
        Object.entries(schema).forEach(([key, config]) => {
            if (config.type === 'color') {
                // Collect color settings separately for bottom panel
                colorKeys.push(key);
            } else {
                const groupKey = config.group || 'effect'; // Default to 'effect' if no group
                if (!groupedSettings[groupKey]) {
                    groupedSettings[groupKey] = [];
                }
                groupedSettings[groupKey].push(key);
            }
        });

        // Render non-color groups in left sidebar (exclude 'colors' group)
        groupOrder.forEach(groupKey => {
            if (groupKey === 'colors') return; // Skip colors, they go in bottom panel
            if (groupedSettings[groupKey] && groupedSettings[groupKey].length > 0) {
                const groupName = groupTitles[groupKey] || groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
                const group = this.createControlGroup(groupName, groupedSettings[groupKey], schema, settings, effect);
                if (group && group.children.length > 1) {
                    settingsContent.appendChild(group);
                    console.log(`✓ Added ${groupName} group with ${groupedSettings[groupKey].length} settings`);
                }
            }
        });

        console.log('✓ Settings panel updated, total groups:', settingsContent.children.length);

        // Update colors panel at the bottom
        this.updateColorsPanel(colorKeys, schema, settings, effect);
    }

    /**
     * Update colors panel (bottom panel between sidebars)
     */
    updateColorsPanel(colorKeys, schema, settings, effect) {
        const colorsContainer = document.getElementById('colors-controls-container');
        if (!colorsContainer) {
            console.error('❌ Colors controls container not found!');
            return;
        }

        colorsContainer.innerHTML = '';

        if (colorKeys.length === 0) {
            colorsContainer.innerHTML = '<p style="color: var(--text-3); text-align: center; padding: var(--space-md);">No color controls available for this effect</p>';
            return;
        }

        // Display all color controls in a row
        const colorsRow = document.createElement('div');
        colorsRow.style.display = 'flex';
        colorsRow.style.gap = 'var(--space-xl)';
        colorsRow.style.flexWrap = 'wrap';
        colorsRow.style.alignItems = 'center';

        colorKeys.forEach(key => {
            const config = schema[key];
            const value = settings[key];

            const colorControl = document.createElement('div');
            colorControl.style.display = 'flex';
            colorControl.style.alignItems = 'center';
            colorControl.style.gap = 'var(--space-sm)';

            const label = document.createElement('label');
            label.textContent = config.label;
            label.style.color = 'var(--text-2)';
            label.style.fontSize = '13px';
            label.style.fontWeight = '500';
            label.style.minWidth = '100px';

            const input = this.createColorInput(value, (newValue) => {
                effect.updateSetting(key, newValue);
                state.set('currentSettings', effect.settings);
            });

            colorControl.appendChild(label);
            colorControl.appendChild(input);
            colorsRow.appendChild(colorControl);
        });

        colorsContainer.appendChild(colorsRow);

        console.log(`✓ Colors panel updated with ${colorKeys.length} color controls`);
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

        // Color preview swatch
        const preview = document.createElement('div');
        preview.className = 'color-preview';
        preview.style.backgroundColor = value;
        preview.title = 'Click to change color';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'coloris'; // Coloris will auto-attach to this
        input.value = value;
        input.dataset.coloris = ''; // Enable Coloris on this input

        // Update preview when color changes
        const updatePreview = (color) => {
            preview.style.backgroundColor = color;
        };

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
                    updatePreview(color);
                    onChange(color);

                    // Trigger Coloris update
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                } catch (err) {
                    // User cancelled or error occurred
                    console.log('Eyedropper cancelled or failed:', err);
                }
            });
        }

        // Coloris change event (fires when picker closes with OK)
        input.addEventListener('change', (e) => {
            const color = e.target.value;
            updatePreview(color);
            onChange(color);
            // Note: Recent colors are tracked in Coloris's global onChange handler
        });

        // Manual text input (for typing HEX values)
        input.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                updatePreview(color);
                onChange(color);
            }
        });

        container.appendChild(preview);
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

        // Select the newly saved preset in the dropdown
        const selector = document.getElementById('preset-selector');
        if (selector && preset && preset.id) {
            selector.value = preset.id;
        }
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
     * Setup camera controls (Sidebar → Camera)
     */
    setupCameraControls() {
        const zoomSlider = document.getElementById('camera-zoom');
        const panXSlider = document.getElementById('camera-pan-x');
        const panYSlider = document.getElementById('camera-pan-y');
        const rotateXSlider = document.getElementById('camera-rotate-x');
        const rotateYSlider = document.getElementById('camera-rotate-y');
        const resetBtn = document.getElementById('camera-reset-btn');

        const zoomValue = document.getElementById('camera-zoom-value');
        const panXValue = document.getElementById('camera-pan-x-value');
        const panYValue = document.getElementById('camera-pan-y-value');
        const rotateXValue = document.getElementById('camera-rotate-x-value');
        const rotateYValue = document.getElementById('camera-rotate-y-value');

        if (!zoomSlider || !this.sceneManager.cameraController) return;

        const controller = this.sceneManager.cameraController;

        // Track current rotation state (in degrees)
        this.cameraRotation = { theta: 0, phi: 90 }; // Start at equator

        // Zoom - slider/input to camera
        const updateZoom = (value) => {
            controller.setState({ zoom: value });
        };

        zoomSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (zoomValue) zoomValue.value = value;
            updateZoom(value);
        });

        if (zoomValue) {
            zoomValue.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                zoomSlider.value = value;
                updateZoom(value);
            });
        }

        // Pan X - slider/input to camera
        const updatePanX = (value) => {
            controller.setState({ panX: value });
        };

        panXSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (panXValue) panXValue.value = value;
            updatePanX(value);
        });

        if (panXValue) {
            panXValue.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                panXSlider.value = value;
                updatePanX(value);
            });
        }

        // Pan Y - slider/input to camera
        const updatePanY = (value) => {
            controller.setState({ panY: value });
        };

        panYSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (panYValue) panYValue.value = value;
            updatePanY(value);
        });

        if (panYValue) {
            panYValue.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                panYSlider.value = value;
                updatePanY(value);
            });
        }

        // Rotate X (Phi - vertical angle)
        const updateRotateX = (value) => {
            this.cameraRotation.phi = 90 - value; // Convert X rotation to phi
            controller.setOrbitRotation(this.cameraRotation.theta, this.cameraRotation.phi);
        };

        rotateXSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (rotateXValue) rotateXValue.value = value;
            updateRotateX(value);
        });

        if (rotateXValue) {
            rotateXValue.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                rotateXSlider.value = value;
                updateRotateX(value);
            });
        }

        // Rotate Y (Theta - horizontal angle)
        const updateRotateY = (value) => {
            this.cameraRotation.theta = value;
            controller.setOrbitRotation(this.cameraRotation.theta, this.cameraRotation.phi);
        };

        rotateYSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (rotateYValue) rotateYValue.value = value;
            updateRotateY(value);
        });

        if (rotateYValue) {
            rotateYValue.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                rotateYSlider.value = value;
                updateRotateY(value);
            });
        }

        // Reset camera
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                controller.reset();

                // Reset rotation tracking
                this.cameraRotation = { theta: 0, phi: 90 };

                // Update UI
                zoomSlider.value = 50;
                panXSlider.value = 0;
                panYSlider.value = 0;
                rotateXSlider.value = 0;
                rotateYSlider.value = 0;

                if (zoomValue) zoomValue.value = 50;
                if (panXValue) panXValue.value = 0;
                if (panYValue) panYValue.value = 0;
                if (rotateXValue) rotateXValue.value = 0;
                if (rotateYValue) rotateYValue.value = 0;

                notification.success('Camera reset');
            });
        }
    }

    /**
     * Setup bidirectional camera sync (Mouse → Sidebar)
     */
    setupCameraSync() {
        if (!this.sceneManager.cameraController) return;

        const controller = this.sceneManager.cameraController;

        // Register sync callback
        controller.onSync((state) => {
            // Update sidebar values when mouse interaction ends
            this.updateCameraSidebarValues(state);
        });
    }

    /**
     * Update sidebar camera values from camera state
     * @param {Object} state - Camera state from CameraController
     */
    updateCameraSidebarValues(state) {
        // Zoom
        const zoomSlider = document.getElementById('camera-zoom');
        const zoomValue = document.getElementById('camera-zoom-value');
        if (zoomSlider && state.zoom !== undefined) {
            zoomSlider.value = state.zoom;
            if (zoomValue) zoomValue.value = Math.round(state.zoom);
        }

        // Pan
        const panXSlider = document.getElementById('camera-pan-x');
        const panXValue = document.getElementById('camera-pan-x-value');
        if (panXSlider && state.panX !== undefined) {
            panXSlider.value = state.panX;
            if (panXValue) panXValue.value = Math.round(state.panX);
        }

        const panYSlider = document.getElementById('camera-pan-y');
        const panYValue = document.getElementById('camera-pan-y-value');
        if (panYSlider && state.panY !== undefined) {
            panYSlider.value = state.panY;
            if (panYValue) panYValue.value = Math.round(state.panY);
        }

        // Rotation (convert spherical to Euler-like for UI)
        const rotateXSlider = document.getElementById('camera-rotate-x');
        const rotateXValue = document.getElementById('camera-rotate-x-value');
        if (rotateXSlider && state.phi !== undefined) {
            // Convert phi to X rotation (vertical)
            const xRotation = 90 - state.phi;
            rotateXSlider.value = xRotation;
            if (rotateXValue) rotateXValue.value = Math.round(xRotation);

            // Update tracking
            this.cameraRotation.phi = state.phi;
        }

        const rotateYSlider = document.getElementById('camera-rotate-y');
        const rotateYValue = document.getElementById('camera-rotate-y-value');
        if (rotateYSlider && state.theta !== undefined) {
            rotateYSlider.value = state.theta;
            if (rotateYValue) rotateYValue.value = Math.round(state.theta);

            // Update tracking
            this.cameraRotation.theta = state.theta;
        }
    }

    /**
     * Setup camera settings controls in App Settings overlay
     */
    setupCameraSettings() {
        if (!this.sceneManager.cameraController) return;

        const controller = this.sceneManager.cameraController;

        // Load saved settings or use defaults
        const savedSettings = localStorage.getItem('cameraSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            panSensitivity: 1.0,
            rotateSensitivity: 1.0,
            zoomSensitivity: 1.0,
            dampingFactor: 0.05
        };

        // Apply settings to controller
        controller.updateSettings(settings);

        // Pan Sensitivity
        const panSensitivitySlider = document.getElementById('camera-pan-sensitivity');
        const panSensitivityValue = document.getElementById('camera-pan-sensitivity-value');

        if (panSensitivitySlider && panSensitivityValue) {
            panSensitivitySlider.value = settings.panSensitivity;
            panSensitivityValue.value = settings.panSensitivity;

            const updatePanSensitivity = (value) => {
                controller.updateSettings({ panSensitivity: parseFloat(value) });
            };

            panSensitivitySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                panSensitivityValue.value = value;
                updatePanSensitivity(value);
            });

            panSensitivityValue.addEventListener('input', (e) => {
                const value = e.target.value;
                panSensitivitySlider.value = value;
                updatePanSensitivity(value);
            });
        }

        // Rotate Sensitivity
        const rotateSensitivitySlider = document.getElementById('camera-rotate-sensitivity');
        const rotateSensitivityValue = document.getElementById('camera-rotate-sensitivity-value');

        if (rotateSensitivitySlider && rotateSensitivityValue) {
            rotateSensitivitySlider.value = settings.rotateSensitivity;
            rotateSensitivityValue.value = settings.rotateSensitivity;

            const updateRotateSensitivity = (value) => {
                controller.updateSettings({ rotateSensitivity: parseFloat(value) });
            };

            rotateSensitivitySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                rotateSensitivityValue.value = value;
                updateRotateSensitivity(value);
            });

            rotateSensitivityValue.addEventListener('input', (e) => {
                const value = e.target.value;
                rotateSensitivitySlider.value = value;
                updateRotateSensitivity(value);
            });
        }

        // Zoom Sensitivity
        const zoomSensitivitySlider = document.getElementById('camera-zoom-sensitivity');
        const zoomSensitivityValue = document.getElementById('camera-zoom-sensitivity-value');

        if (zoomSensitivitySlider && zoomSensitivityValue) {
            zoomSensitivitySlider.value = settings.zoomSensitivity;
            zoomSensitivityValue.value = settings.zoomSensitivity;

            const updateZoomSensitivity = (value) => {
                controller.updateSettings({ zoomSensitivity: parseFloat(value) });
            };

            zoomSensitivitySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                zoomSensitivityValue.value = value;
                updateZoomSensitivity(value);
            });

            zoomSensitivityValue.addEventListener('input', (e) => {
                const value = e.target.value;
                zoomSensitivitySlider.value = value;
                updateZoomSensitivity(value);
            });
        }

        // Damping Factor
        const dampingFactorSlider = document.getElementById('camera-damping-factor');
        const dampingFactorValue = document.getElementById('camera-damping-factor-value');

        if (dampingFactorSlider && dampingFactorValue) {
            dampingFactorSlider.value = settings.dampingFactor;
            dampingFactorValue.value = settings.dampingFactor;

            const updateDampingFactor = (value) => {
                controller.updateSettings({ dampingFactor: parseFloat(value) });
            };

            dampingFactorSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                dampingFactorValue.value = value;
                updateDampingFactor(value);
            });

            dampingFactorValue.addEventListener('input', (e) => {
                const value = e.target.value;
                dampingFactorSlider.value = value;
                updateDampingFactor(value);
            });
        }

        // Save Settings button
        const saveSettingsBtn = document.getElementById('save-app-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                // Get current settings from controller
                const currentSettings = {
                    panSensitivity: controller.settings.panSensitivity,
                    rotateSensitivity: controller.settings.rotateSensitivity,
                    zoomSensitivity: controller.settings.zoomSensitivity,
                    dampingFactor: controller.settings.dampingFactor
                };

                // Save to localStorage
                localStorage.setItem('cameraSettings', JSON.stringify(currentSettings));

                // Show notification
                notification.success('Camera settings saved');
            });
        }
    }

    /**
     * Setup playback controls
     */
    setupPlaybackControls() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const speedSlider = document.getElementById('speed-slider');
        const speedValueInput = document.getElementById('speed-value-input');

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

        if (speedSlider && speedValueInput) {
            // Initialize with current speed from state
            const initialSpeed = state.get('animationSpeed') || 1.0;
            speedSlider.value = initialSpeed;
            speedValueInput.value = initialSpeed.toFixed(1);

            // Sync slider with number input
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                speedValueInput.value = speed.toFixed(1);
                // Update global animation speed
                state.set('animationSpeed', speed);
            });

            // Sync number input with slider
            speedValueInput.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                speedSlider.value = speed;
                // Update global animation speed
                state.set('animationSpeed', speed);
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

            // Combine default swatches (10) with recent colors (up to 5)
            const defaultSwatches = appSettings.getColorSwatches();
            const recentColors = appSettings.getRecentColors();

            // Coloris displays swatches in rows of 5
            // Row 1-2: Default swatches (10 colors)
            // Row 3: Recent colors (up to 5 colors)
            const allSwatches = [...defaultSwatches, ...recentColors];

            // Initialize Coloris according to official documentation
            // https://coloris.js.org/
            Coloris({
                el: '.coloris',
                theme: 'pill',
                themeMode: 'dark',
                formatToggle: true,
                alpha: true,
                swatches: allSwatches,
                onChange: (color, inputEl) => {
                    if (!inputEl) return;

                    // Track recently used colors
                    if (/^#[0-9A-F]{6}$/i.test(color)) {
                        appSettings.addRecentColor(color);
                        // Reinitialize with updated swatches
                        this.initializeColoris();
                    }
                }
            });

            console.log(`✓ Coloris initialized (${defaultSwatches.length} default + ${recentColors.length} recent)`);
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
            preview.title = `Click to edit color ${index + 1}`;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'color-swatch-input';
            input.value = color.toUpperCase();
            input.dataset.swatchIndex = index;
            input.dataset.coloris = ''; // Enable Coloris on this input
            input.placeholder = '#000000';
            input.maxLength = 7;

            // Manual hex validation (for direct typing only)
            input.addEventListener('input', (e) => {
                let value = e.target.value.toUpperCase();

                // Ensure it starts with #
                if (!value.startsWith('#')) {
                    value = '#' + value;
                }

                // Only allow valid hex characters
                value = value.replace(/[^#0-9A-F]/g, '');

                e.target.value = value;

                // Only update preview, don't save yet
                if (/^#[0-9A-F]{6}$/.test(value)) {
                    preview.style.backgroundColor = value;
                }
            });

            // Coloris change event (fires when user clicks OK or when typing is complete)
            input.addEventListener('change', (e) => {
                const value = e.target.value.toUpperCase();
                if (/^#[0-9A-F]{6}$/.test(value)) {
                    preview.style.backgroundColor = value;
                    appSettings.updateColorSwatch(index, value);
                    appSettings.addRecentColor(value); // Track as recent color
                    this.showSaveColorsFeedback();
                }
            });

            // Handle blur (when user tabs away after manual typing)
            input.addEventListener('blur', (e) => {
                const value = e.target.value.toUpperCase();
                if (/^#[0-9A-F]{6}$/.test(value)) {
                    appSettings.updateColorSwatch(index, value);
                    appSettings.addRecentColor(value); // Track as recent color
                    this.showSaveColorsFeedback();
                }
            });

            // Click preview to open Coloris picker
            preview.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Just focus the input - Coloris will handle the rest
                input.focus();
            });

            item.appendChild(preview);
            item.appendChild(input);
            grid.appendChild(item);
        });

        // Initialize Coloris on the new inputs
        this.initializeColorisForSwatches();
    }

    /**
     * Show save feedback for color changes
     */
    showSaveColorsFeedback() {
        const btn = document.getElementById('save-colors-btn');
        if (!btn) return;

        // Show "Saved!" feedback
        const originalText = btn.textContent;
        btn.textContent = 'Saved!';
        btn.classList.add('saved');

        // Reinitialize Coloris globally with new swatches
        // This updates ALL color pickers across the app
        this.initializeColoris();

        // Revert after 2.5 seconds
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('saved');
        }, 2500);
    }

    /**
     * Initialize Coloris specifically for color swatch inputs
     */
    initializeColorisForSwatches() {
        if (!window.Coloris) {
            console.warn('⚠️ Coloris not loaded for swatches');
            return;
        }

        // Reinitialize Coloris with current swatches (for settings overlay)
        setTimeout(() => {
            const swatches = appSettings.getColorSwatches();
            Coloris({
                el: '.color-swatch-input',
                theme: 'pill',
                themeMode: 'dark',
                formatToggle: true,
                alpha: true,
                swatches: swatches
            });
        }, 100);
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

// Export App class for shell initialization
export default App;
