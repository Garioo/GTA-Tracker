// UI rendering functions for GTA Race Tracker
import { state } from './state.js';

// Job Components
export const JobCard = (job) => `
    <div class="job-card p-4">
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-lg font-semibold">${job.title}</h3>
                <p class="text-sm text-muted">Created by ${job.creator}</p>
            </div>
            <div class="text-right">
                <p class="text-sm">Rating: ${job.rating}</p>
            </div>
        </div>
        <div class="mt-4 grid grid-cols-1 gap-2 text-sm">
            <p><span class="font-medium">Game Mode:</span> ${job.gameMode}</p>
            <p><span class="font-medium">Route Type:</span> ${job.routeType}</p>
            <p><span class="font-medium">Route Length:</span> ${job.routeLength}</p>
        </div>
    </div>
`;

export const JobCardCompact = (job, playlistIndex = null, selectedNumber = null, disabled = false) => {
    const isSelected = state.selectedJobs.has(job.url);
    const selectedClass = isSelected ? 'border-accent bg-accent/5' : '';
    const selectedAttr = isSelected ? 'true' : 'false';
    const numberOpacity = isSelected ? '' : 'opacity-0';
    
    return `
    <div class="group flex items-center gap-3 p-3 bg-card-bg border border-border rounded-lg hover:bg-hover transition-all duration-200 cursor-pointer relative ${disabled ? 'opacity-60 pointer-events-none' : ''} ${selectedClass} h-[80px]"
         data-job-url="${job.url}"
         data-job-id="${job._id || job.id}"
         data-selected="${selectedAttr}">
        ${(playlistIndex != null || selectedNumber != null) ? `
            <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-accent text-text text-xs font-bold shadow-sm">
                ${playlistIndex != null ? playlistIndex + 1 : selectedNumber}
            </div>
        ` : ''}
        <div class="min-w-0 flex-1 flex flex-col justify-center">
            <div class="flex items-center justify-between">
                <div class="min-w-0">
                    <h4 class="text-sm font-medium truncate">${job.title}</h4>
                    <p class="text-xs text-muted truncate">by ${job.creator}</p>
                </div>
                <div class="flex items-center gap-2 ml-2">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent shadow-sm">
                        <i class="fas fa-star mr-1"></i>${job.rating}
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-2 mt-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary shadow-sm">
                    <i class="fas fa-gamepad mr-1"></i>${job.gameMode}
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent shadow-sm">
                    <i class="fas fa-route mr-1"></i>${job.routeType}
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary shadow-sm">
                    <i class="fas fa-ruler mr-1"></i>${job.routeLength}
                </span>
            </div>
        </div>
        <div class="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full selected-number ${numberOpacity} group-hover:opacity-100 transition-all duration-200">${selectedNumber || ''}</div>
    </div>
    `;
};

// Playlist Components
export const PlaylistCard = (playlist) => `
    <div class="minimal-card p-4 hover:bg-hover transition-colors">
        <div class="flex justify-between items-center">
            <div>
                <h3 class="text-lg font-semibold">${playlist.name}</h3>
                <p class="text-sm text-muted">${playlist.jobs.length} jobs</p>
            </div>
            <div class="flex space-x-2">
                <button class="minimal-btn" onclick="window.viewPlaylist('${playlist._id}')">
                    <i class="fas fa-eye mr-2"></i>View
                </button>
                <button class="minimal-btn" onclick="window.editPlaylist('${playlist._id}')">
                    <i class="fas fa-edit mr-2"></i>Edit
                </button>
                <button class="minimal-btn" onclick="window.deletePlaylist('${playlist._id}')">
                    <i class="fas fa-trash mr-2"></i>Delete
                </button>
            </div>
        </div>
    </div>
`;

export const PlaylistDetails = (playlist) => `
    <div class="flex items-center mb-4">
        <button id="backToPlaylists" class="minimal-btn mr-4">
            <i class="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h2 id="playlistDetailsTitle" class="text-2xl font-bold">${playlist.name}</h2>
    </div>
    <div class="flex gap-4">
        <div class="w-1/2">
            <div class="minimal-card p-4">
                <h3 class="font-bold text-lg mb-4 flex items-center">
                    <i class="fas fa-chart-bar mr-2 text-primary"></i>
                    Playlist Overview
                </h3>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-primary/10 p-3 rounded-lg">
                        <div class="text-sm text-primary mb-1">
                            <i class="fas fa-list mr-1"></i>Total Jobs
                        </div>
                        <div class="text-2xl font-bold">${playlist.jobs.length}</div>
                        <div class="text-xs text-muted mt-1">
                            ${playlist.jobs.filter(job => job.gameMode === 'Race').length} Races
                        </div>
                    </div>
                    <div class="bg-secondary/10 p-3 rounded-lg">
                        <div class="text-sm text-secondary mb-1">
                            <i class="fas fa-users mr-1"></i>Total Players
                        </div>
                        <div class="text-2xl font-bold">${playlist.players?.length || 0}</div>
                        <div class="text-xs text-muted mt-1">
                            ${playlist.stats?.filter(stat => stat.placement === 1).length || 0} Wins
                        </div>
                    </div>
                </div>
                <div class="bg-accent/10 p-3 rounded-lg mb-4">
                    <div class="text-sm text-accent mb-1">
                        <i class="fas fa-trophy mr-1"></i>Total Points
                    </div>
                    <div class="text-2xl font-bold">${
                        playlist.stats?.reduce((total, stat) => {
                            const points = [15,12,10,8,7,6,5,4,3,2,1,0][stat.placement - 1] || 0;
                            return total + points;
                        }, 0) || 0
                    }</div>
                    <div class="text-xs text-muted mt-1">
                        ${playlist.stats?.length || 0} Race Results
                    </div>
                </div>
                <div class="bg-card-bg p-3 rounded-lg mb-4 border border-border">
                    <div class="text-sm text-muted mb-2">
                        <i class="fas fa-chart-line mr-1"></i>Top Performers
                    </div>
                    <div class="space-y-2">
                        ${(() => {
                            const playerPoints = {};
                            playlist.stats?.forEach(stat => {
                                if (!playerPoints[stat.username]) playerPoints[stat.username] = 0;
                                const points = [15,12,10,8,7,6,5,4,3,2,1,0][stat.placement - 1] || 0;
                                playerPoints[stat.username] += points;
                            });
                            return Object.entries(playerPoints)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 3)
                                .map(([player, points], index) => `
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <span class="text-xs font-medium text-muted mr-2">#${index + 1}</span>
                                            <span class="text-sm font-medium">${player}</span>
                                        </div>
                                        <span class="text-sm font-bold">${points} pts</span>
                                    </div>
                                `).join('') || '<div class="text-sm text-muted">No results yet</div>';
                        })()}
                    </div>
                </div>
                <div class="text-sm text-muted flex items-center">
                    <i class="fas fa-calendar mr-1"></i>
                    Created: ${new Date(playlist.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
        <div class="w-1/2">
            <div class="minimal-card p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-lg flex items-center">
                        <i class="fas fa-flag-checkered mr-2 text-primary"></i>
                        Race Jobs
                    </h3>
                    <div class="flex space-x-2">
                        <button id="addJobsToPlaylist" class="minimal-btn">
                            <i class="fas fa-plus mr-2"></i>Add Jobs
                        </button>
                        <button id="managePlayersBtn" class="minimal-btn">
                            <i class="fas fa-users mr-2"></i>Manage Players
                        </button>
                    </div>
                </div>
                <div id="playlistJobs" class="grid grid-cols-1 gap-2">
                    ${playlist.jobs.map(job => `
                        <div class="job-card p-3 flex justify-between items-center hover:bg-hover transition-colors rounded-lg">
                            <div>
                                <h3 class="font-semibold">${job.title}</h3>
                                <div class="text-sm text-muted">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary mr-2">
                                        <i class="fas fa-gamepad mr-1"></i>${job.gameMode}
                                    </span>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/20 text-secondary mr-2">
                                        <i class="fas fa-route mr-1"></i>${job.routeType}
                                    </span>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent">
                                        <i class="fas fa-ruler mr-1"></i>${job.routeLength}
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                                    <i class="fas fa-star mr-1"></i>${job.rating}
                                </div>
                                <button onclick="window.removeJobFromPlaylist('${job.url}')" class="minimal-btn">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
`;

// Modal Components
export const CreatePlaylistModal = () => `
    <div id="createPlaylistModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="minimal-card p-6 w-96 shadow-xl">
            <h3 class="modal-title section-title text-2xl mb-4">Create New Playlist</h3>
            <input type="text" id="playlistName" placeholder="Playlist Name" class="input w-full mb-4">
            <div class="flex justify-end space-x-2">
                <button id="cancelCreate" class="minimal-btn">Cancel</button>
                <button id="confirmCreate" class="btn">Create</button>
            </div>
        </div>
    </div>
`;

export const AddJobsModal = () => `
    <div id="addJobsModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="minimal-card rounded-xl shadow-xl flex flex-col backdrop-blur-sm" style="width: 800px; max-height: 90vh;">
            <div class="flex items-center justify-between p-4 border-b border-border">
                <div>
                    <h3 class="text-lg font-semibold">Add Races</h3>
                    <p class="text-xs text-muted mt-0.5">Select races to add to your playlist</p>
                </div>
                <button id="cancelAddJobs" class="text-muted hover:text-accent transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div class="flex items-center gap-4 mb-4">
                    <div class="relative flex-1">
                        <input type="text" id="jobSearch" placeholder="Search races..." style="width: 100%; padding: 8px 32px; border-radius: 8px; border: 1px solid #ccc; background: #fff; color: #000;">
                        <i class="fas fa-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #666;"></i>
                    </div>
                    <div class="filter-container">
                        <select id="jobsFilterDropdown" class="input">
                            <option value="recentlyPlayed">Recently Played</option>
                            <option value="mostPlayed">Most Played</option>
                            <option value="recentlyAdded">Recently Added</option>
                        </select>
                    </div>
                </div>
                <div id="availableJobs" class="grid grid-cols-1 gap-3 relative">
                    <!-- Available jobs will be inserted here -->
                </div>
            </div>
            <div class="flex justify-between items-center gap-4 p-4 border-t border-border bg-card-bg">
                <div class="text-sm text-muted">
                    <span id="selectedCount" class="font-medium text-accent">0</span> races selected
                </div>
                <div class="flex gap-3">
                    <button id="cancelAddJobsBtn" class="minimal-btn">Cancel</button>
                    <button id="confirmAddJobs" class="btn">Add Selected Races</button>
                </div>
            </div>
        </div>
    </div>
`;

export const UserSelectModal = () => `
    <div id="userSelectModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="minimal-card p-6 w-96 shadow-xl">
            <h3 class="text-xl font-bold mb-4">Select User</h3>
            <form id="userSelectForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium">User</label>
                    <select id="userDropdown" class="input mt-1 w-full"></select>
                </div>
                <div id="newUserSection" class="hidden">
                    <label class="block text-sm font-medium">New Username</label>
                    <input type="text" id="newUsername" class="input mt-1 w-full">
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" id="cancelUserSelect" class="minimal-btn">Cancel</button>
                    <button type="submit" class="btn">Select</button>
                </div>
            </form>
        </div>
    </div>
`;

export const ManagePlayersModal = () => `
    <div id="managePlayersModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="minimal-card p-6 w-96 shadow-xl">
            <h3 class="section-title text-xl mb-4">Manage Players</h3>
            <form id="managePlayersForm" class="space-y-2 mb-4">
                <div id="playersCheckboxList"></div>
            </form>
            <div class="flex justify-end space-x-2">
                <button id="cancelManagePlayers" class="minimal-btn">Cancel</button>
                <button id="saveManagePlayers" class="btn">Save</button>
            </div>
        </div>
    </div>
`;

// Export components
window.Components = {
    JobCard,
    JobCardCompact,
    PlaylistCard,
    PlaylistDetails,
    CreatePlaylistModal,
    AddJobsModal,
    UserSelectModal,
    ManagePlayersModal
};

window.initializeJobSelection = () => {
    // Clear any existing selections
    document.querySelectorAll('#availableJobs .group').forEach(card => {
        const jobUrl = card.getAttribute('data-job-url');
        const jobId = card.getAttribute('data-job-id');
        const isSelected = state.selectedJobs.has(jobUrl);
        
        card.setAttribute('data-selected', isSelected ? 'true' : 'false');
        if (isSelected) {
            card.classList.add('border-primary', 'bg-primary/10');
            card.classList.remove('hover:bg-card-bg');
        } else {
            card.classList.remove('border-primary', 'bg-primary/10');
            card.classList.add('hover:bg-card-bg');
        }
        
        const numberDiv = card.querySelector('.selected-number');
        if (numberDiv) {
            if (isSelected) {
                numberDiv.classList.remove('opacity-0');
                const selectedIndex = Array.from(state.selectedJobs.keys()).indexOf(jobUrl);
                numberDiv.textContent = selectedIndex + 1;
            } else {
                numberDiv.classList.add('opacity-0');
            }
        }
    });
    
    // Add click handlers
    document.querySelectorAll('#availableJobs .group').forEach(card => {
        const jobUrl = card.getAttribute('data-job-url');
        const job = state.jobs.find(j => (j.url || '').trim().toLowerCase() === (jobUrl || '').trim().toLowerCase());
        if (job) {
            card.onclick = () => window.toggleJobSelection(card, job);
        }
    });
    
    // Update counter
    const counter = document.getElementById('selectedCount');
    if (counter) {
        counter.textContent = state.selectedJobs.size;
    }
}; 