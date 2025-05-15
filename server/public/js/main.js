// Main application logic for GTA Race Tracker

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

// State management
const state = {
    currentUser: null,
    currentPlaylist: null,
    jobs: [],
    playlists: [],
    selectedJobs: new Map(),
    isLoading: false,
    error: null
};

// Utility functions
const utils = {
    showLoading: () => {
        state.isLoading = true;
        elements.loadingOverlay?.classList.remove('hidden');
    },
    
    hideLoading: () => {
        state.isLoading = false;
        elements.loadingOverlay?.classList.add('hidden');
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

// Jobs handling
const jobs = {
    load: async () => {
        utils.showLoading();
        try {
            state.jobs = await API.jobs.getAll();
            jobs.render();
        } catch (error) {
            utils.showError('Failed to load jobs: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    },
    
    render: () => {
        if (!state.jobs.length) {
            elements.jobsList.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">No jobs available</p>
                </div>
            `;
            return;
        }
        
        elements.jobsList.innerHTML = state.jobs.map(job => Components.JobCard(job)).join('');
    },
    
    renderCompact: (container, filter = null) => {
        if (!container) return;

        // Get jobs in the current playlist (if any)
        const playlistJobs = state.currentPlaylist?.jobs || [];

        // Filtering logic
        let jobsToShow = [...state.jobs];
        if (filter === 'recentlyPlayed') {
            jobsToShow.sort((a, b) => new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0));
        } else if (filter === 'mostPlayed') {
            jobsToShow.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
        } else if (filter === 'recentlyAdded') {
            jobsToShow.sort((a, b) => new Date(b.creationDate || 0) - new Date(a.creationDate || 0));
        }

        // Get selected jobs in order
        const selectedJobs = Array.from(state.selectedJobs.values());

        // Render all jobs with playlist number and selection state
        container.innerHTML = jobsToShow.map(job => {
            // If job is in playlist, show its number and keep it checked/disabled
            const playlistIndex = playlistJobs.findIndex(j => j.url === job.url);
            if (playlistIndex !== -1) {
                return Components.JobCardCompact(job, playlistIndex, true, true);
            }
            // Otherwise, show as selectable, and show number if selected
            const selectedIndex = selectedJobs.findIndex(j => j.url === job.url);
            return Components.JobCardCompact(job, selectedIndex >= 0 ? selectedIndex : null, selectedIndex >= 0, false);
        }).join('');

        // Update selected jobs count safely
        const selectedJobsCountElem = document.getElementById('selectedJobsCount');
        if (selectedJobsCountElem) {
            selectedJobsCountElem.textContent = selectedJobs.length;
        }
    },
    
    search: utils.debounce((query) => {
        const filtered = state.jobs.filter(job => 
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.creator.toLowerCase().includes(query.toLowerCase())
        );
        elements.jobsList.innerHTML = filtered.map(job => Components.JobCard(job)).join('');
    }, 300)
};

// Playlists handling
const playlists = {
    load: async () => {
        utils.showLoading();
        try {
            state.playlists = await API.playlists.getAll();
            playlists.render();
        } catch (error) {
            utils.showError('Failed to load playlists: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    },
    
    render: () => {
        if (!state.playlists.length) {
            elements.playlistsList.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">No playlists available</p>
                    <button class="btn mt-4" onclick="modals.showCreatePlaylist()">
                        <i class="fas fa-plus mr-2"></i>Create Playlist
                    </button>
                </div>
            `;
            return;
        }
        
        elements.playlistsList.innerHTML = state.playlists.map(playlist => 
            Components.PlaylistCard(playlist)
        ).join('');
    },
    
    view: async (id) => {
        utils.showLoading();
        try {
            state.currentPlaylist = await API.playlists.getById(id);
            playlists.renderDetails();
            navigation.showPlaylistDetails();
        } catch (error) {
            utils.showError('Failed to load playlist: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    },
    
    renderDetails: () => {
        if (!state.currentPlaylist) return;
        
        const container = elements.playlistDetailsSection;
        container.innerHTML = Components.PlaylistDetails(state.currentPlaylist);
        
        // Add event listeners
        document.getElementById('backToPlaylists')?.addEventListener('click', navigation.showPlaylists);
        document.getElementById('addJobsToPlaylist')?.addEventListener('click', modals.showAddJobs);
        document.getElementById('managePlayersBtn')?.addEventListener('click', modals.showManagePlayers);
    },
    
    removeJob: async (jobUrl) => {
        if (!state.currentPlaylist) return;
        
        if (!confirm('Are you sure you want to remove this job from the playlist?')) {
            return;
        }
        
        utils.showLoading();
        try {
            await API.playlists.removeJob(state.currentPlaylist._id, jobUrl);
            await playlists.view(state.currentPlaylist._id);
        } catch (error) {
            utils.showError('Failed to remove job: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    },
    
    create: async (name) => {
        utils.showLoading();
        try {
            console.log('Creating playlist:', name);
            const playlist = await API.playlists.create(name);
            console.log('Playlist created:', playlist);
            state.playlists.push(playlist);
            playlists.render();
            return playlist;
        } catch (error) {
            console.error('Create playlist error:', error);
            utils.showError('Failed to create playlist: ' + error.message);
            throw error;
        } finally {
            utils.hideLoading();
        }
    },

    edit: async (id, newName) => {
        utils.showLoading();
        try {
            await API.playlists.update(id, { name: newName });
            const playlist = state.playlists.find(p => p._id === id);
            if (playlist) {
                playlist.name = newName;
            }
            playlists.render();
        } catch (error) {
            utils.showError('Failed to update playlist: ' + error.message);
            throw error;
        } finally {
            utils.hideLoading();
        }
    },

    delete: async (id) => {
        if (!confirm('Are you sure you want to delete this playlist?')) return;
        
        utils.showLoading();
        try {
            console.log('Deleting playlist:', id);
            const result = await API.playlists.delete(id);
            console.log('Delete result:', result);
            
            if (result.success) {
                state.playlists = state.playlists.filter(p => p._id !== id);
                playlists.render();
                navigation.showPlaylists();
            } else {
                utils.showError(result.message || 'Failed to delete playlist');
            }
        } catch (error) {
            console.error('Delete playlist error:', error);
            utils.showError('Failed to delete playlist: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    }
};

// User handling
const users = {
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
            console.error('Error loading users:', error);
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
            console.error('Error selecting user:', error);
            utils.showError('Failed to select user: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    },
    
    renderSection: () => {
        if (!elements.userSection) return;
        
        elements.userSection.innerHTML = state.currentUser
            ? `
                <span class="mr-2">${state.currentUser.username}</span>
                <button class="minimal-btn" onclick="modals.showUserSelect()">
                    <i class="fas fa-user-edit mr-2"></i>Change
                </button>
            `
            : `
                <button class="minimal-btn" onclick="modals.showUserSelect()">
                    <i class="fas fa-user mr-2"></i>Select User
                </button>
            `;
    }
};

// Modal handling
const modals = {
    showUserSelect: () => {
        elements.userSelectModal.classList.remove('hidden');
        // Ensure the form is reset
        document.getElementById('userSelectForm').reset();
    },
    
    hideUserSelect: () => {
        elements.userSelectModal.classList.add('hidden');
    },
    
    showAddJobs: () => {
        elements.addJobsModal.classList.remove('hidden');
        // Clear previous selections
        state.selectedJobs.clear();
        // Render available jobs
        jobs.renderCompact(document.getElementById('availableJobs'));
        // Only update if the element exists
        const selectedJobsCountElem = document.getElementById('selectedJobsCount');
        if (selectedJobsCountElem) {
            selectedJobsCountElem.textContent = '0';
        }
        // Add search functionality
        const searchInput = document.getElementById('jobSearch');
        if (searchInput) {
            // Remove any existing event listeners
            searchInput.removeEventListener('input', modals.handleJobSearch);
            // Add new event listener
            searchInput.addEventListener('input', modals.handleJobSearch);
        }
        setupJobsFilterBar();
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
        elements.addJobsModal.classList.add('hidden');
        state.selectedJobs.clear();
    },
    
    showManagePlayers: () => {
        if (!state.currentPlaylist) return;
        
        elements.managePlayersModal.classList.remove('hidden');
        const playersList = document.getElementById('playersCheckboxList');
        
        // Get all unique players from stats and current players
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
        elements.managePlayersModal.classList.add('hidden');
    },
    
    showCreatePlaylist: () => {
        elements.createPlaylistModal.classList.remove('hidden');
        // Clear the input field
        document.getElementById('playlistName').value = '';
    },
    
    hideCreatePlaylist: () => {
        elements.createPlaylistModal.classList.add('hidden');
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
        elements.editPlaylistModal.classList.add('hidden');
    }
};

// Event Listeners
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

// Export functions for use in HTML
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
window.toggleJobSelection = (checkbox, job) => {
    if (checkbox.checked) {
        state.selectedJobs.set(job.url, job);
    } else {
        state.selectedJobs.delete(job.url);
    }
    // Only update if the modal and container exist
    const container = document.getElementById('availableJobs');
    if (container && document.getElementById('selectedJobsCount')) {
        jobs.renderCompact(container);
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