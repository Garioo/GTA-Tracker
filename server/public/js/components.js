// UI rendering functions for GTA Race Tracker

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

export const JobCardCompact = (job, playlistIndex = null, selectedNumber = null, disabled = false) => `
    <div class="minimal-card flex items-center p-2 shadow-sm rounded border border-gray-200 mb-2 hover:bg-gray-50 transition-colors cursor-pointer ${disabled ? 'opacity-60 pointer-events-none' : ''}"
         data-job-url="${job.url}"
         style="background: #fff;">
        <div class="flex items-center mr-3">
            ${(playlistIndex != null || selectedNumber != null) ? `
                <div class="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                    ${playlistIndex != null ? playlistIndex + 1 : selectedNumber}
                </div>
            ` : ''}
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center">
                <div class="min-w-0">
                    <h4 class="font-medium text-sm truncate">${job.title}</h4>
                    <p class="text-xs text-gray-500 truncate">by ${job.creator}</p>
                </div>
                <div class="flex items-center space-x-2 ml-2">
                    <div class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <i class="fas fa-star mr-0.5"></i>${job.rating}
                    </div>
                </div>
            </div>
            <div class="mt-1 flex flex-wrap gap-1">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <i class="fas fa-gamepad mr-0.5"></i>${job.gameMode}
                </span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <i class="fas fa-route mr-0.5"></i>${job.routeType}
                </span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    <i class="fas fa-ruler mr-0.5"></i>${job.routeLength}
                </span>
            </div>
        </div>
    </div>
`;

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
        <div class="minimal-card p-4 w-2/3 h-[70vh] shadow-xl overflow-hidden flex flex-col bg-white rounded-lg">
            <div class="flex items-center justify-between mb-4 pb-3 border-b">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800">Add Jobs to Playlist</h3>
                    <p class="text-xs text-gray-500 mt-0.5">Select jobs to add to your playlist</p>
                </div>
                <button id="cancelAddJobs" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex-1 min-h-0 overflow-y-auto pr-2">
                <div id="availableJobs" class="grid grid-cols-1 gap-1.5">
                    <!-- Available jobs will be inserted here -->
                </div>
            </div>
            <div class="flex justify-end space-x-2 mt-4 pt-3 border-t">
                <button id="cancelAddJobsBtn" class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                    Cancel
                </button>
                <button id="confirmAddJobs" class="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors">
                    Add Selected
                </button>
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