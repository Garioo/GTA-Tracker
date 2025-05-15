// User-related logic
import { utils } from './utils.js';
import { state } from './state.js';
import { modals } from './modals.js';

export const users = {
    load: async () => {
        utils.showLoading();
        try {
            const usersList = await API.users.getAll();
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                dropdown.innerHTML = usersList.map(user => `
                    <option value="${user.username}">${user.username}</option>
                `).join('');
            }
        } catch (error) {
            utils.showError('Failed to load users: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    },
    select: async (username) => {
        utils.showLoading();
        try {
            state.currentUser = await API.users.create(username);
            users.renderSection();
        } catch (error) {
            utils.showError('Failed to select user: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    },
    renderSection: () => {
        const userSection = document.getElementById('userSection');
        if (!userSection) return;
        userSection.innerHTML = state.currentUser
            ? `
                <span class="mr-2">${state.currentUser.username}</span>
                <button id="changeUserBtn" class="minimal-btn">
                    <i class="fas fa-user-edit mr-2"></i>Change
                </button>
            `
            : `
                <button id="selectUserBtn" class="minimal-btn">
                    <i class="fas fa-user mr-2"></i>Select User
                </button>
            `;
        
        // Add event listeners
        document.getElementById('changeUserBtn')?.addEventListener('click', modals.showUserSelect);
        document.getElementById('selectUserBtn')?.addEventListener('click', modals.showUserSelect);
    }
}; 