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
const navigation = {
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
        
        const selectedJobs = Array.from(state.selectedJobs.values());
        if (selectedJobs.length === 0) {
            utils.showError('Please select at least one job');
            return;
        }
        
        utils.showLoading();
        try {
            console.log('Adding jobs to playlist:', selectedJobs);
            for (const job of selectedJobs) {
                console.log('Adding job:', job);
                try {
                    await API.playlists.addJob(state.currentPlaylist._id, job);
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
window.toggleJobSelection = (cardElem, job) => {
    console.log('toggleJobSelection called for job:', job.title, job.url);
    // If job is already in the playlist, do nothing
    const playlistJobs = state.currentPlaylist?.jobs || [];
    if (playlistJobs.some(j => j.url === job.url)) return;
    // Toggle selection
    if (state.selectedJobs.has(job.url)) {
        state.selectedJobs.delete(job.url);
    } else {
        state.selectedJobs.set(job.url, job);
    }
    // Only update if the modal and container exist
    const container = document.getElementById('availableJobs');
    const filterDropdown = document.getElementById('jobsFilterDropdown');
    const filter = filterDropdown ? filterDropdown.value : null;
    console.log('Re-rendering jobs.renderCompact with filter:', filter, 'Selected jobs:', Array.from(state.selectedJobs.keys()));
    if (container && document.getElementById('selectedJobsCount')) {
        jobs.renderCompact(container, filter);
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