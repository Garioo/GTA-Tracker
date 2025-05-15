// Main application logic for GTA Race Tracker (modular refactor)
import { jobs } from './jobs.js';
import { playlists } from './playlists.js';
import { users } from './users.js';
import { modals } from './modals.js';
import { state } from './state.js';
import { utils } from './utils.js';

// DOM Elements
const elements = {
    // Navigation
    showJobs: document.getElementById('showJobs'),
    showPlaylists: document.getElementById('showPlaylists'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Sections
    jobsSection: document.getElementById('jobsSection'),
    playlistsSection: document.getElementById('playlistsSection'),
    playlistDetailsSection: document.getElementById('playlistDetailsSection'),
    
    // Lists
    jobsList: document.getElementById('jobsList'),
    playlistsList: document.getElementById('playlistsList'),
    playlistJobs: document.getElementById('playlistJobs'),
    
    // User
    userSection: document.getElementById('userSection'),
    
    // Footer
    yearSpan: document.getElementById('yearSpan'),
    
    // Modals
    createPlaylistModal: document.getElementById('createPlaylistModal'),
    addJobsModal: document.getElementById('addJobsModal'),
    editPlaylistModal: document.getElementById('editPlaylistModal'),
    userSelectModal: document.getElementById('userSelectModal'),
    managePlayersModal: document.getElementById('managePlayersModal'),
    
    // Loading States
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Theme handling
const theme = {
    set: (isDark) => {
        document.body.classList.toggle('theme-black', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        // Update theme toggle icon
        elements.themeToggle.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    },
    
    init: () => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme.set(savedTheme === 'dark' || (!savedTheme && prefersDark));
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                theme.set(e.matches);
            }
        });
    },
    
    toggle: () => theme.set(!document.body.classList.contains('theme-black'))
};

// Navigation
export const navigation = {
    showSection: (section) => {
        elements.jobsSection.classList.add('hidden');
        elements.playlistsSection.classList.add('hidden');
        elements.playlistDetailsSection.classList.add('hidden');
        section.classList.remove('hidden');
        
        // Update active nav state
        elements.showJobs.classList.toggle('active', section === elements.jobsSection);
        elements.showPlaylists.classList.toggle('active', section === elements.playlistsSection);
    },
    
    showJobs: () => navigation.showSection(elements.jobsSection),
    showPlaylists: () => navigation.showSection(elements.playlistsSection),
    showPlaylistDetails: () => navigation.showSection(elements.playlistDetailsSection)
};

// App initialization and event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    theme.init();
    
    // Set current year in footer
    elements.yearSpan.textContent = new Date().getFullYear();
    
    // Load initial data
    jobs.load();
    playlists.load();
    users.load();
    
    // Add error event listener
    document.addEventListener('showError', (e) => {
        utils.showError(e.detail.message);
    });
    
    // Navigation
    elements.showJobs.addEventListener('click', navigation.showJobs);
    elements.showPlaylists.addEventListener('click', navigation.showPlaylists);
    elements.themeToggle.addEventListener('click', theme.toggle);
    
    // Jobs section
    document.getElementById('refreshJobs')?.addEventListener('click', jobs.load);
    
    // Playlists section
    document.getElementById('createPlaylist')?.addEventListener('click', modals.showCreatePlaylist);
    
    // Create playlist modal
    document.getElementById('confirmCreate')?.addEventListener('click', async () => {
        const nameInput = document.getElementById('playlistName');
        const name = nameInput.value.trim();
        
        if (!name) {
            utils.showError('Please enter a playlist name');
            return;
        }
        
        utils.showLoading();
        try {
            await playlists.create(name);
            modals.hideCreatePlaylist();
            nameInput.value = ''; // Clear the input
        } catch (error) {
            console.error('Create playlist error:', error);
            utils.showError('Failed to create playlist: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    });
    
    document.getElementById('cancelCreate')?.addEventListener('click', modals.hideCreatePlaylist);
    
    // Add jobs modal
    document.getElementById('cancelAddJobs')?.addEventListener('click', modals.hideAddJobs);
    document.getElementById('confirmAddJobs')?.addEventListener('click', async () => {
        if (!state.currentPlaylist) {
            utils.showError('No playlist selected');
            return;
        }
        
        if (state.selectedJobs.size === 0) {
            utils.showError('Please select at least one job');
            return;
        }
        
        const selectedJobs = Array.from(state.selectedJobs.values());
        
        utils.showLoading();
        try {
            console.log('Adding jobs to playlist:', selectedJobs);
            for (const job of selectedJobs) {
                console.log('Adding job:', job);
                try {
                    await API.playlists.addJob(state.currentPlaylist._id, job.url);
                } catch (error) {
                    if (error.message.includes('404') || error.message.includes('not found')) {
                        utils.showError('Playlist not found. Please refresh the page and try again.');
                        return;
                    }
                    throw error;
                }
            }
            console.log('Jobs added successfully');
            await playlists.view(state.currentPlaylist._id);
            modals.hideAddJobs();
        } catch (error) {
            console.error('Add jobs error:', error);
            utils.showError('Failed to add jobs: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    });
    
    // Manage players modal
    document.getElementById('cancelManagePlayers')?.addEventListener('click', modals.hideManagePlayers);
    document.getElementById('saveManagePlayers')?.addEventListener('click', async () => {
        if (!state.currentPlaylist) return;
        
        const checkboxes = document.querySelectorAll('#playersCheckboxList input[type="checkbox"]');
        const selectedPlayers = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
            
        if (selectedPlayers.length === 0) {
            utils.showError('Please select at least one player');
            return;
        }
        
        utils.showLoading();
        try {
            await API.playlists.updatePlayers(state.currentPlaylist._id, selectedPlayers);
            await playlists.view(state.currentPlaylist._id);
            modals.hideManagePlayers();
        } catch (error) {
            utils.showError('Failed to update players: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    });
    
    // User selection
    document.getElementById('userSelectForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('userDropdown').value;
        if (!username) {
            utils.showError('Please select a user');
            return;
        }
        await users.select(username);
        modals.hideUserSelect();
    });
    
    document.getElementById('cancelUserSelect')?.addEventListener('click', modals.hideUserSelect);
    
    // Edit playlist modal
    document.getElementById('cancelEdit')?.addEventListener('click', modals.hideEditPlaylist);
    document.getElementById('confirmEdit')?.addEventListener('click', async () => {
        if (!state.currentPlaylist) return;
        
        const newName = document.getElementById('editPlaylistName').value.trim();
        if (!newName) {
            utils.showError('Please enter a playlist name');
            return;
        }
        
        utils.showLoading();
        try {
            await playlists.edit(state.currentPlaylist._id, newName);
            playlists.renderDetails();
            modals.hideEditPlaylist();
        } catch (error) {
            utils.showError('Failed to update playlist: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    });
});

// Export for HTML event handlers
window.viewPlaylist = playlists.view;
window.editPlaylist = (id) => {
    const playlist = state.playlists.find(p => p._id === id);
    if (playlist) {
        state.currentPlaylist = playlist;
        const modal = document.getElementById('editPlaylistModal');
        document.getElementById('editPlaylistName').value = playlist.name;
        modal.classList.remove('hidden');
    }
};
window.deletePlaylist = playlists.delete;
window.removeJobFromPlaylist = playlists.removeJob;
window.showUserSelectModal = modals.showUserSelect;
window.toggleJobSelection = async (cardElem, job) => {
    console.log('toggleJobSelection called for job:', job.title, job.url);
    
    // Check if job is already in the playlist
    const playlistJobs = state.currentPlaylist?.jobs || [];
    const isInPlaylist = playlistJobs.some(j => (j.url || '').trim().toLowerCase() === (job.url || '').trim().toLowerCase());
    
    if (isInPlaylist) {
        // If job is in playlist, remove it
        utils.showLoading();
        try {
            await API.playlists.removeJob(state.currentPlaylist._id, job.url);
            await playlists.view(state.currentPlaylist._id);
            // Re-render the jobs list to update the UI
            const container = document.getElementById('availableJobs');
            const filterDropdown = document.getElementById('jobsFilterDropdown');
            const filter = filterDropdown ? filterDropdown.value : null;
            jobs.renderCompact(container, filter);
        } catch (error) {
            utils.showError('Failed to remove job: ' + error.message);
        } finally {
            utils.hideLoading();
        }
        return;
    }
    
    // Toggle selection in state for jobs not in playlist
    if (state.selectedJobs.has(job.url)) {
        state.selectedJobs.delete(job.url);
        cardElem.classList.remove('bg-blue-50', 'border-blue-500');
        cardElem.classList.add('hover:bg-gray-50');
    } else {
        state.selectedJobs.set(job.url, job);
        cardElem.classList.add('bg-blue-50', 'border-blue-500');
        cardElem.classList.remove('hover:bg-gray-50');
    }
    
    // Update the job card's visual state
    const selectedJobs = Array.from(state.selectedJobs.values());
    const selectedIndex = selectedJobs.findIndex(j => (j.url || '').trim().toLowerCase() === (job.url || '').trim().toLowerCase());
    
    // Update the number indicator
    const numberIndicator = cardElem.querySelector('.flex.items-center.mr-2');
    if (numberIndicator) {
        if (selectedIndex >= 0) {
            numberIndicator.innerHTML = `
                <div style="background:#3b82f6;color:white;width:1.25rem;height:1.25rem;display:flex;align-items:center;justify-content:center;border-radius:9999px;font-weight:bold;font-size:0.75rem;margin-left:0.375rem;">
                    ${playlistJobs.length + selectedIndex + 1}
                </div>
            `;
        } else {
            numberIndicator.innerHTML = '';
        }
    }
    
    // Update the selected jobs count
    const selectedJobsCountElem = document.getElementById('selectedJobsCount');
    if (selectedJobsCountElem) {
        selectedJobsCountElem.textContent = selectedJobs.length;
    }
};

// Add event listeners for filter buttons in the Add Jobs modal
function setupJobsFilterBar() {
    const filterBar = document.getElementById('jobsFilterBar');
    if (!filterBar) return;
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('bg-blue-500', 'text-white'));
            btn.classList.add('bg-blue-500', 'text-white');
            const filter = btn.getAttribute('data-filter');
            jobs.renderCompact(document.getElementById('availableJobs'), filter);
        });
    });
}

// Add event listener for filter dropdown in the Add Jobs modal
function setupJobsFilterDropdown() {
    const dropdown = document.getElementById('jobsFilterDropdown');
    if (!dropdown) return;
    dropdown.addEventListener('change', () => {
        jobs.renderCompact(document.getElementById('availableJobs'), dropdown.value);
    });
}

// Call setupJobsFilterDropdown when showing the Add Jobs modal
const originalShowAddJobs = modals.showAddJobs;
modals.showAddJobs = function() {
    originalShowAddJobs.call(this);
    setupJobsFilterDropdown();
}; 