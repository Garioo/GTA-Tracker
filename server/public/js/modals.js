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
            // Render jobs immediately with the default filter
            jobs.renderCompact(document.getElementById('availableJobs'), 'recentlyAdded');
        }
        // jobs.renderCompact will be called from main.js after import
        const selectedJobsCountElem = document.getElementById('selectedCount');
        if (selectedJobsCountElem) {
            selectedJobsCountElem.textContent = '0';
        }
        const searchInput = document.getElementById('jobSearch');
        if (searchInput) {
            searchInput.removeEventListener('input', modals.handleJobSearch);
            searchInput.addEventListener('input', utils.debounce(modals.handleJobSearch, 300));
            searchInput.value = ''; // Clear search input when opening modal
        }
        
        // Initialize job selection after jobs are rendered
        setTimeout(() => {
            if (typeof window.initializeJobSelection === 'function') {
                window.initializeJobSelection();
            }
        }, 100);
    },
    handleJobSearch: (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const jobCards = document.querySelectorAll('#availableJobs .group');
        let visibleCount = 0;

        jobCards.forEach(card => {
            const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
            const creator = card.querySelector('p.text-gray-500')?.textContent.toLowerCase() || '';
            const gameMode = card.querySelector('.job-tag-mode')?.textContent.toLowerCase() || '';
            const routeType = card.querySelector('.job-tag-type')?.textContent.toLowerCase() || '';
            const routeLength = card.querySelector('.job-tag-length')?.textContent.toLowerCase() || '';
            
            const isVisible = searchTerm === '' || 
                title.includes(searchTerm) || 
                creator.includes(searchTerm) || 
                gameMode.includes(searchTerm) ||
                routeType.includes(searchTerm) ||
                routeLength.includes(searchTerm);
            
            if (isVisible) {
                visibleCount++;
                card.classList.remove('hidden');
                card.classList.add('visible', 'fade-in');
                card.classList.remove('fade-out');
            } else {
                card.classList.add('hidden', 'fade-out');
                card.classList.remove('visible', 'fade-in');
            }
        });

        // Show "no results" message if needed
        const noResultsMsg = document.getElementById('noSearchResults');
        if (visibleCount === 0 && searchTerm !== '') {
            if (!noResultsMsg) {
                const msg = document.createElement('div');
                msg.id = 'noSearchResults';
                msg.className = 'text-center py-4 text-muted';
                msg.textContent = 'No races found matching your search';
                document.getElementById('availableJobs').appendChild(msg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
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