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
    const selectedClass = isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : '';
    const selectedAttr = isSelected ? 'true' : 'false';
    const numberOpacity = isSelected ? '' : 'opacity-0';
    
    return `
    <div class="group flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-sm transition-all duration-200 cursor-pointer relative ${disabled ? 'opacity-60 pointer-events-none' : ''} ${selectedClass} h-[72px]"
         data-job-url="${job.url}"
         data-job-id="${job._id || job.id}"
         data-selected="${selectedAttr}">
        ${(playlistIndex != null || selectedNumber != null) ? `
            <div class="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold shadow-sm">
                ${playlistIndex != null ? playlistIndex + 1 : selectedNumber}
            </div>
        ` : ''}
        <div class="min-w-0 flex-1 flex flex-col justify-center">
            <div class="flex items-center justify-between">
                <div class="min-w-0">
                    <h4 class="text-sm font-medium truncate text-gray-900 dark:text-gray-100">${job.title}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">by ${job.creator}</p>
                </div>
                <div class="flex items-center gap-1 ml-2">
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-800 dark:text-yellow-200 shadow-sm">
                        <i class="fas fa-star mr-0.5"></i>${job.rating}
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-200 shadow-sm">
                    <i class="fas fa-gamepad mr-0.5"></i>${job.gameMode}
                </span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-200 shadow-sm">
                    <i class="fas fa-route mr-0.5"></i>${job.routeType}
                </span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-800 dark:text-purple-200 shadow-sm">
                    <i class="fas fa-ruler mr-0.5"></i>${job.routeLength}
                </span>
            </div>
        </div>
        <div class="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold shadow-sm ${numberOpacity} group-hover:opacity-100 transition-opacity duration-200 selected-number">${selectedNumber || ''}</div>
    </div>
    `;
};

// Playlist Components
export const PlaylistCard = (playlist) => `
    <div class="minimal-card p-4 hover:bg-gray-50 transition-colors">
        <div class="flex justify-between items-center">
            <div>
                <h3 class="text-lg font-semibold">${playlist.name}</h3>
                <p class="text-sm text-muted">${playlist.jobs.length} jobs</p>
            </div>
            <div class="flex space-x-2">
                <button class="minimal-btn bg-blue-500 text-white hover:bg-blue-600" onclick="window.viewPlaylist('${playlist._id}')">
                    <i class="fas fa-eye mr-2"></i>View
                </button>
                <button class="minimal-btn bg-green-500 text-white hover:bg-green-600" onclick="window.editPlaylist('${playlist._id}')">
                    <i class="fas fa-edit mr-2"></i>Edit
                </button>
                <button class="minimal-btn bg-red-500 text-white hover:bg-red-600" onclick="window.deletePlaylist('${playlist._id}')">
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
                    <i class="fas fa-chart-bar mr-2 text-blue-500"></i>
                    Playlist Overview
                </h3>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <div class="text-sm text-blue-600 mb-1">
                            <i class="fas fa-list mr-1"></i>Total Jobs
                        </div>
                        <div class="text-2xl font-bold text-blue-700">${playlist.jobs.length}</div>
                        <div class="text-xs text-blue-500 mt-1">
                            ${playlist.jobs.filter(job => job.gameMode === 'Race').length} Races
                        </div>
                    </div>
                    <div class="bg-green-50 p-3 rounded-lg">
                        <div class="text-sm text-green-600 mb-1">
                            <i class="fas fa-users mr-1"></i>Total Players
                        </div>
                        <div class="text-2xl font-bold text-green-700">${playlist.players?.length || 0}</div>
                        <div class="text-xs text-green-500 mt-1">
                            ${playlist.stats?.filter(stat => stat.placement === 1).length || 0} Wins
                        </div>
                    </div>
                </div>
                <div class="bg-purple-50 p-3 rounded-lg mb-4">
                    <div class="text-sm text-purple-600 mb-1">
                        <i class="fas fa-trophy mr-1"></i>Total Points
                    </div>
                    <div class="text-2xl font-bold text-purple-700">${
                        playlist.stats?.reduce((total, stat) => {
                            const points = [15,12,10,8,7,6,5,4,3,2,1,0][stat.placement - 1] || 0;
                            return total + points;
                        }, 0) || 0
                    }</div>
                    <div class="text-xs text-purple-500 mt-1">
                        ${playlist.stats?.length || 0} Race Results
                    </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg mb-4">
                    <div class="text-sm text-gray-600 mb-2">
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
                                            <span class="text-xs font-medium text-gray-500 mr-2">#${index + 1}</span>
                                            <span class="text-sm font-medium text-gray-700">${player}</span>
                                        </div>
                                        <span class="text-sm font-bold text-gray-900">${points} pts</span>
                                    </div>
                                `).join('') || '<div class="text-sm text-gray-500">No results yet</div>';
                        })()}
                    </div>
                </div>
                <div class="text-sm text-gray-500 flex items-center">
                    <i class="fas fa-calendar mr-1"></i>
                    Created: ${new Date(playlist.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
        <div class="w-1/2">
            <div class="minimal-card p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-lg flex items-center">
                        <i class="fas fa-flag-checkered mr-2 text-red-500"></i>
                        Race Jobs
                    </h3>
                    <div class="flex space-x-2">
                        <button id="addJobsToPlaylist" class="minimal-btn bg-blue-500 text-white hover:bg-blue-600">
                            <i class="fas fa-plus mr-2"></i>Add Jobs
                        </button>
                        <button id="managePlayersBtn" class="minimal-btn bg-green-500 text-white hover:bg-green-600">
                            <i class="fas fa-users mr-2"></i>Manage Players
                        </button>
                    </div>
                </div>
                <div id="playlistJobs" class="grid grid-cols-1 gap-2">
                    ${playlist.jobs.map(job => `
                        <div class="job-card p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                            <div>
                                <h3 class="font-semibold text-gray-800">${job.title}</h3>
                                <div class="text-sm text-gray-500">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                        <i class="fas fa-gamepad mr-1"></i>${job.gameMode}
                                    </span>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">
                                        <i class="fas fa-route mr-1"></i>${job.routeType}
                                    </span>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                        <i class="fas fa-ruler mr-1"></i>${job.routeLength}
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <i class="fas fa-star mr-1"></i>${job.rating}
                                </div>
                                <button onclick="window.removeJobFromPlaylist('${job.url}')" class="minimal-btn bg-red-500 text-white hover:bg-red-600 p-2">
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
                <button id="cancelCreate" class="btn bg-gray-300 hover:bg-gray-400">Cancel</button>
                <button id="confirmCreate" class="btn bg-blue-500 text-white hover:bg-blue-600">Create</button>
            </div>
        </div>
    </div>
`;

export const AddJobsModal = () => `
    <div id="addJobsModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col backdrop-blur-sm" style="width: 500px; max-height: 80vh;">
            <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Jobs</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Select jobs to add to your playlist</p>
                </div>
                <button id="cancelAddJobs" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
                <div class="flex items-center gap-2 mb-4">
                    <div class="relative flex-1">
                        <input type="text" id="jobSearch" placeholder="Search jobs..." class="w-full p-2 pl-8 border dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400">
                        <i class="fas fa-search absolute left-2.5 top-2.5 text-gray-400 dark:text-gray-500 text-sm"></i>
                    </div>
                    <select id="jobsFilterDropdown" class="border dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="recentlyPlayed">Recently Played</option>
                        <option value="mostPlayed">Most Played</option>
                        <option value="recentlyAdded">Recently Added</option>
                    </select>
                </div>
                <div id="availableJobs" class="space-y-2 relative">
                    <!-- Available jobs will be inserted here -->
                </div>
            </div>
            <div class="flex justify-between items-center gap-2 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                    <span id="selectedCount" class="font-medium">0</span> jobs selected
                </div>
                <div class="flex gap-2">
                    <button id="cancelAddJobsBtn" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button id="confirmAddJobs" class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-colors shadow-sm">
                        Add Selected
                    </button>
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
                    <label class="block text-sm font-medium text-gray-700">User</label>
                    <select id="userDropdown" class="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></select>
                </div>
                <div id="newUserSection" class="hidden">
                    <label class="block text-sm font-medium text-gray-700">New Username</label>
                    <input type="text" id="newUsername" class="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" id="cancelUserSelect" class="btn bg-gray-300 hover:bg-gray-400">Cancel</button>
                    <button type="submit" class="btn bg-blue-500 text-white hover:bg-blue-600">Select</button>
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
                <button id="cancelManagePlayers" class="btn bg-gray-300 hover:bg-gray-400">Cancel</button>
                <button id="saveManagePlayers" class="btn bg-blue-500 text-white hover:bg-blue-600">Save</button>
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
            card.classList.add('border-blue-500', 'bg-blue-50');
            card.classList.remove('hover:bg-gray-50');
        } else {
            card.classList.remove('border-blue-500', 'bg-blue-50');
            card.classList.add('hover:bg-gray-50');
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