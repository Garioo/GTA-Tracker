// Utility functions
export const utils = {
    showLoading: () => {
        state.isLoading = true;
        document.getElementById('loadingOverlay')?.classList.remove('hidden');
    },
    hideLoading: () => {
        state.isLoading = false;
        document.getElementById('loadingOverlay')?.classList.add('hidden');
    },
    showError: (message) => {
        state.error = message;
        console.error('Error:', message);
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        errorDiv.textContent = message;
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'ml-2 text-white hover:text-gray-200';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => errorDiv.remove();
        errorDiv.appendChild(closeButton);
        // Add to document
        document.body.appendChild(errorDiv);
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    },
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}; 