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
        
        const selectedJobElements = document.querySelectorAll('#availableJobs .group[data-selected="true"]');
        if (selectedJobElements.length === 0) {
            utils.showError('Please select at least one job');
            return;
        }
        
        const selectedJobs = Array.from(selectedJobElements).map(el => {
            const jobUrl = el.getAttribute('data-job-url');
            const job = state.jobs.find(j => (j.url || '').trim().toLowerCase() === (jobUrl || '').trim().toLowerCase());
            if (!job) {
                throw new Error(`Job not found: ${jobUrl}`);
            }
            return job;
        });
        
        utils.showLoading();
        try {
            console.log('Adding jobs to playlist:', selectedJobs);
            await API.playlists.addJob(state.currentPlaylist._id, selectedJobs);
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
    const isSelected = state.selectedJobs.has(job.url);
    
    if (isSelected) {
        // Deselect
        state.selectedJobs.delete(job.url);
        cardElem.setAttribute('data-selected', 'false');
        cardElem.classList.remove('border-blue-500', 'bg-blue-50');
        cardElem.classList.add('hover:bg-gray-50');
    } else {
        // Select
        state.selectedJobs.set(job.url, job);
        cardElem.setAttribute('data-selected', 'true');
        cardElem.classList.add('border-blue-500', 'bg-blue-50');
        cardElem.classList.remove('hover:bg-gray-50');
    }
    
    // Update the number indicator
    const numberDiv = cardElem.querySelector('.selected-number');
    if (numberDiv) {
        if (!isSelected) {
            numberDiv.classList.remove('opacity-0');
            numberDiv.textContent = state.selectedJobs.size;
        } else {
            numberDiv.classList.add('opacity-0');
        }
    }
    
    // Update all selection numbers
    let currentNumber = 1;
    Array.from(state.selectedJobs.keys()).forEach(selectedUrl => {
        const selectedCard = document.querySelector(`#availableJobs .group[data-job-url="${selectedUrl}"]`);
        if (selectedCard) {
            const selectedNumberDiv = selectedCard.querySelector('.selected-number');
            if (selectedNumberDiv) {
                selectedNumberDiv.textContent = currentNumber++;
            }
        }
    });
    
    // Update the selected jobs count
    const counter = document.getElementById('selectedCount');
    if (counter) {
        counter.textContent = state.selectedJobs.size;
    }

    // Log selection state for debugging
    console.log('Selection state:', {
        stateSelectedJobs: state.selectedJobs.size,
        dataSelectedElements: document.querySelectorAll('#availableJobs .group[data-selected="true"]').length,
        selectedUrls: Array.from(state.selectedJobs.keys())
    });
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