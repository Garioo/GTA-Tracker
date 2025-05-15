// Modal-related logic
import { state } from './state.js';
import { utils } from './utils.js';
import { jobs } from './jobs.js';

export const modals = {
    showUserSelect: () => {
        document.getElementById('userSelectModal').classList.remove('hidden');
        document.getElementById('userSelectForm').reset();
    },
    hideUserSelect: () => {
        document.getElementById('userSelectModal').classList.add('hidden');
    },
    showAddJobs: () => {
        document.getElementById('addJobsModal').classList.remove('hidden');
        state.selectedJobs.clear();
        // Set Recently Added as default filter
        const filterDropdown = document.getElementById('jobsFilterDropdown');
        if (filterDropdown) {
            filterDropdown.value = 'recentlyAdded';
            // Trigger the change event to apply the filter
            filterDropdown.dispatchEvent(new Event('change'));
        }
        // jobs.renderCompact will be called from main.js after import
        const selectedJobsCountElem = document.getElementById('selectedJobsCount');
        if (selectedJobsCountElem) {
            selectedJobsCountElem.textContent = '0';
        }
        const searchInput = document.getElementById('jobSearch');
        if (searchInput) {
            searchInput.removeEventListener('input', modals.handleJobSearch);
            searchInput.addEventListener('input', modals.handleJobSearch);
        }
    },
    handleJobSearch: (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const jobCards = document.querySelectorAll('#availableJobs .minimal-card');
        jobCards.forEach(card => {
            const title = card.querySelector('.section-title').textContent.toLowerCase();
            const creator = card.querySelector('.label').textContent.toLowerCase();
            const gameMode = card.querySelector('.bg-blue-100').textContent.toLowerCase();
            const routeType = card.querySelector('.bg-green-100').textContent.toLowerCase();
            const routeLength = card.querySelector('.bg-purple-100').textContent.toLowerCase();
            if (title.includes(searchTerm) || 
                creator.includes(searchTerm) || 
                gameMode.includes(searchTerm) ||
                routeType.includes(searchTerm) ||
                routeLength.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    },
    hideAddJobs: () => {
        document.getElementById('addJobsModal').classList.add('hidden');
        state.selectedJobs.clear();
    },
    showManagePlayers: () => {
        if (!state.currentPlaylist) return;
        document.getElementById('managePlayersModal').classList.remove('hidden');
        const playersList = document.getElementById('playersCheckboxList');
        const allPlayers = new Set([
            ...(state.currentPlaylist.players || []),
            ...(state.currentPlaylist.stats || []).map(stat => stat.username)
        ]);
        if (allPlayers.size === 0) {
            playersList.innerHTML = '<p class="text-gray-500 text-center py-2">No players available</p>';
            return;
        }
        playersList.innerHTML = Array.from(allPlayers).map(player => `
            <label class="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <input type="checkbox" value="${player}" 
                    ${(state.currentPlaylist.players || []).includes(player) ? 'checked' : ''}>
                <span>${player}</span>
            </label>
        `).join('');
    },
    hideManagePlayers: () => {
        document.getElementById('managePlayersModal').classList.add('hidden');
    },
    showCreatePlaylist: () => {
        document.getElementById('createPlaylistModal').classList.remove('hidden');
        document.getElementById('playlistName').value = '';
    },
    hideCreatePlaylist: () => {
        document.getElementById('createPlaylistModal').classList.add('hidden');
    },
    showEditPlaylist: (id) => {
        state.currentPlaylist = state.playlists.find(p => p._id === id);
        if (state.currentPlaylist) {
            const modal = document.getElementById('editPlaylistModal');
            document.getElementById('editPlaylistName').value = state.currentPlaylist.name;
            modal.classList.remove('hidden');
        }
    },
    hideEditPlaylist: () => {
        document.getElementById('editPlaylistModal').classList.add('hidden');
    }
}; 