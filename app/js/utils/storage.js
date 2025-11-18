/**
 * LocalStorage Utility Functions
 * Safe wrappers for LocalStorage operations
 */

/**
 * Get item from LocalStorage with JSON parsing
 */
export function getItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading "${key}" from localStorage:`, error);
        return defaultValue;
    }
}

/**
 * Set item in LocalStorage with JSON stringification
 */
export function setItem(key, value) {
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

/**
 * Remove item from LocalStorage
 */
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing "${key}" from localStorage:`, error);
        return false;
    }
}

/**
 * Clear all LocalStorage
 */
export function clear() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
}

/**
 * Check if LocalStorage is available
 */
export function isAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get storage usage info
 */
export function getStorageInfo() {
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

export default {
    getItem,
    setItem,
    removeItem,
    clear,
    isAvailable,
    getStorageInfo
};
