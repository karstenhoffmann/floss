/**
 * Notification System
 * Toast notifications with auto-dismiss
 */

const ICONS = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
};

const DEFAULT_DURATION = 4000;

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    init() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            console.error('Notification container not found');
        }
    }

    /**
     * Show notification
     * @param {Object} options - Notification options
     * @param {string} options.type - Type: success, error, warning, info
     * @param {string} options.message - Message text
     * @param {number} options.duration - Duration in ms (0 = no auto-dismiss)
     * @param {Array} options.actions - Array of {label, onClick} objects
     */
    show({ type = 'info', message, duration = DEFAULT_DURATION, actions = [] }) {
        if (!this.container) return null;

        const id = `notification-${Date.now()}-${Math.random()}`;
        const notification = this.createNotification(id, type, message, actions);

        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(id);
            }, duration);
        }

        return id;
    }

    /**
     * Create notification DOM element
     */
    createNotification(id, type, message, actions) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const icon = document.createElement('div');
        icon.className = 'notification__icon';
        icon.textContent = ICONS[type] || ICONS.info;

        const content = document.createElement('div');
        content.className = 'notification__content';

        const messageEl = document.createElement('div');
        messageEl.className = 'notification__message';
        messageEl.textContent = message;
        content.appendChild(messageEl);

        // Actions
        if (actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'notification__actions';

            actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'notification__action-btn';
                btn.textContent = action.label;
                btn.onclick = () => {
                    action.onClick();
                    this.dismiss(id);
                };
                actionsContainer.appendChild(btn);
            });

            content.appendChild(actionsContainer);
        }

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification__close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.dismiss(id);

        notification.appendChild(icon);
        notification.appendChild(content);
        notification.appendChild(closeBtn);

        return notification;
    }

    /**
     * Dismiss notification
     */
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        notification.classList.add('closing');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);
    }

    /**
     * Dismiss all notifications
     */
    dismissAll() {
        this.notifications.forEach((_, id) => {
            this.dismiss(id);
        });
    }

    /**
     * Shorthand methods
     */
    success(message, duration) {
        return this.show({ type: 'success', message, duration });
    }

    error(message, duration = 6000) {
        return this.show({ type: 'error', message, duration });
    }

    warning(message, duration) {
        return this.show({ type: 'warning', message, duration });
    }

    info(message, duration) {
        return this.show({ type: 'info', message, duration });
    }
}

// Export singleton instance
export default new NotificationSystem();
