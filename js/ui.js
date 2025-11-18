/**
 * UI State Management & Event Handlers
 * Manages floating panels, toolbar, playback controls
 */

class UIManager {
  constructor() {
    this.state = {
      currentEffect: 0,
      isPlaying: true,
      speed: 1.0,
      autoHideUI: true,
      settingsPanelOpen: false,
      lastInteraction: Date.now()
    };

    this.elements = {
      // Topbar
      effectSelectorBtn: document.getElementById('effectSelectorBtn'),
      effectDropdown: document.getElementById('effectDropdown'),
      currentEffect: document.getElementById('currentEffect'),
      settingsBtn: document.getElementById('settingsBtn'),

      // Toolbar
      toolbar: document.getElementById('toolbar'),

      // Playback
      playback: document.getElementById('playback'),
      playBtn: document.getElementById('playBtn'),
      playIcon: document.getElementById('playIcon'),
      pauseIcon: document.getElementById('pauseIcon'),
      resetBtn: document.getElementById('resetBtn'),
      exportBtn: document.getElementById('exportBtn'),
      speedSlider: document.getElementById('speedSlider'),
      speedValue: document.getElementById('speedValue'),

      // Panels
      settingsPanel: document.getElementById('settingsPanel'),

      // Loader
      loader: document.getElementById('loader')
    };

    this.effectOptions = [
      { name: 'Endless', index: 0 },
      { name: 'Swirl', index: 1 },
      { name: 'Twisted', index: 2 },
      { name: 'Relax', index: 3 }
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadState();
    this.startAutoHideTimer();
  }

  bindEvents() {
    // Effect Selector
    this.elements.effectSelectorBtn?.addEventListener('click', () => this.toggleEffectDropdown());
    document.querySelectorAll('.effect-option').forEach((option, index) => {
      option.addEventListener('click', () => this.selectEffect(index));
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.elements.effectSelectorBtn?.contains(e.target) &&
          !this.elements.effectDropdown?.contains(e.target)) {
        this.closeEffectDropdown();
      }
    });

    // Settings Panel
    this.elements.settingsBtn?.addEventListener('click', () => this.toggleSettingsPanel());
    document.querySelector('.panel__close')?.addEventListener('click', () => this.closeSettingsPanel());

    // Playback Controls
    this.elements.playBtn?.addEventListener('click', () => this.togglePlayPause());
    this.elements.resetBtn?.addEventListener('click', () => this.reset());
    this.elements.exportBtn?.addEventListener('click', () => this.export());
    this.elements.speedSlider?.addEventListener('input', (e) => this.updateSpeed(e.target.value));

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Mouse movement tracking for auto-hide
    document.addEventListener('mousemove', () => this.onInteraction());
    document.addEventListener('click', () => this.onInteraction());

    // Toolbar buttons
    document.querySelectorAll('.toolbar__btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = e.currentTarget.dataset.tool;
        console.log(`Tool clicked: ${tool}`);
        // TODO: Implement tool panels
      });
    });

    // Settings toggles
    document.querySelectorAll('.toggle input').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const label = e.target.closest('.setting-group').querySelector('.setting-label').textContent;
        if (label === 'Auto-hide UI') {
          this.state.autoHideUI = e.target.checked;
          this.saveState();
        }
      });
    });
  }

  // Effect Dropdown
  toggleEffectDropdown() {
    const isExpanded = this.elements.effectSelectorBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      this.closeEffectDropdown();
    } else {
      this.openEffectDropdown();
    }
  }

  openEffectDropdown() {
    this.elements.effectSelectorBtn.setAttribute('aria-expanded', 'true');
    this.elements.effectDropdown.hidden = false;
  }

  closeEffectDropdown() {
    this.elements.effectSelectorBtn.setAttribute('aria-expanded', 'false');
    this.elements.effectDropdown.hidden = true;
  }

  selectEffect(index) {
    this.state.currentEffect = index;
    this.elements.currentEffect.textContent = this.effectOptions[index].name;
    this.closeEffectDropdown();
    this.saveState();

    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('effectChange', { detail: { index } }));
  }

  // Settings Panel
  toggleSettingsPanel() {
    if (this.state.settingsPanelOpen) {
      this.closeSettingsPanel();
    } else {
      this.openSettingsPanel();
    }
  }

  openSettingsPanel() {
    this.state.settingsPanelOpen = true;
    this.elements.settingsPanel.hidden = false;
  }

  closeSettingsPanel() {
    this.state.settingsPanelOpen = false;
    this.elements.settingsPanel.hidden = true;
  }

  // Playback Controls
  togglePlayPause() {
    this.state.isPlaying = !this.state.isPlaying;
    this.updatePlayPauseIcon();

    // Dispatch event
    window.dispatchEvent(new CustomEvent('playbackToggle', {
      detail: { isPlaying: this.state.isPlaying }
    }));
  }

  updatePlayPauseIcon() {
    if (this.state.isPlaying) {
      this.elements.playIcon.hidden = true;
      this.elements.pauseIcon.hidden = false;
    } else {
      this.elements.playIcon.hidden = false;
      this.elements.pauseIcon.hidden = true;
    }
  }

  reset() {
    console.log('Reset triggered');
    window.dispatchEvent(new CustomEvent('reset'));
  }

  export() {
    console.log('Export triggered');
    // TODO: Implement screenshot/video export
    alert('Export feature coming soon!');
  }

  updateSpeed(value) {
    this.state.speed = parseFloat(value);
    this.elements.speedValue.textContent = this.state.speed.toFixed(1) + 'x';
    this.saveState();

    // Dispatch event
    window.dispatchEvent(new CustomEvent('speedChange', {
      detail: { speed: this.state.speed }
    }));
  }

  // Keyboard Shortcuts
  handleKeyboard(e) {
    // Space - Play/Pause
    if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
      e.preventDefault();
      this.togglePlayPause();
    }

    // Escape - Close panels/dropdowns
    if (e.code === 'Escape') {
      this.closeEffectDropdown();
      this.closeSettingsPanel();
    }

    // 1-4 - Quick effect selection
    if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
      const index = parseInt(e.code.replace('Digit', '')) - 1;
      if (index >= 0 && index < this.effectOptions.length) {
        this.selectEffect(index);
      }
    }
  }

  // Auto-hide UI
  onInteraction() {
    this.state.lastInteraction = Date.now();
    this.showUI();
  }

  showUI() {
    this.elements.toolbar?.classList.remove('hide');
    this.elements.playback?.classList.remove('hide');
  }

  hideUI() {
    if (this.state.autoHideUI && !this.state.settingsPanelOpen) {
      this.elements.toolbar?.classList.add('hide');
      this.elements.playback?.classList.add('hide');
    }
  }

  startAutoHideTimer() {
    setInterval(() => {
      const timeSinceInteraction = Date.now() - this.state.lastInteraction;
      if (timeSinceInteraction > 3000) { // 3 seconds
        this.hideUI();
      }
    }, 1000);
  }

  // State Persistence
  loadState() {
    try {
      const saved = localStorage.getItem('ttk1n3t1c-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };

        // Apply loaded state
        if (this.state.currentEffect !== undefined) {
          this.elements.currentEffect.textContent = this.effectOptions[this.state.currentEffect].name;
        }
        if (this.state.speed !== undefined) {
          this.elements.speedSlider.value = this.state.speed;
          this.elements.speedValue.textContent = this.state.speed.toFixed(1) + 'x';
        }
        this.updatePlayPauseIcon();
      }
    } catch (err) {
      console.warn('Failed to load state:', err);
    }
  }

  saveState() {
    try {
      localStorage.setItem('ttk1n3t1c-state', JSON.stringify({
        currentEffect: this.state.currentEffect,
        speed: this.state.speed,
        autoHideUI: this.state.autoHideUI
      }));
    } catch (err) {
      console.warn('Failed to save state:', err);
    }
  }

  // Loader
  hideLoader() {
    setTimeout(() => {
      this.elements.loader?.classList.add('hidden');
      setTimeout(() => {
        this.elements.loader?.remove();
      }, 500);
    }, 500);
  }
}

// Initialize UI Manager
const ui = new UIManager();

// Export for use in other modules
export default ui;
