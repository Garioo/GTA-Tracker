// UI rendering functions for GTA Race Tracker

// Job Components
const JobCard = (job) => `
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

const JobCardCompact = (job) => `
    <div class="minimal-card flex items-center p-3 shadow rounded mb-2">
        <input type="checkbox" class="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500" 
               onchange="toggleJobSelection(this, ${JSON.stringify(job).replace(/\"/g, '&quot;')})">
        <div class="flex-1">
            <h4 class="font-bold section-title">${job.title}</h4>
            <p class="label text-sm">by ${job.creator}</p>
        </div>
    </div>
`;

// Playlist Components
const PlaylistCard = (playlist) => `
    <div class="minimal-card p-4">
        <div class="flex justify-between items-center">
            <div>
                <h3 class="text-lg font-semibold">${playlist.name}</h3>
                <p class="text-sm text-muted">${playlist.jobs.length} jobs</p>
            </div>
            <div class="flex space-x-2">
                <button class="minimal-btn" onclick="viewPlaylist('${playlist._id}')">
                    <i class="fas fa-eye mr-2"></i>View
                </button>
                <button class="minimal-btn" onclick="editPlaylist('${playlist._id}')">
                    <i class="fas fa-edit mr-2"></i>Edit
                </button>
            </div>
        </div>
    </div>
`;

const PlaylistDetails = (playlist) => `
    <div class="flex items-center mb-4">
        <button id="backToPlaylists" class="minimal-btn mr-4">
            <i class="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h2 id="playlistDetailsTitle" class="text-2xl font-bold">${playlist.name}</h2>
    </div>
    <div class="flex gap-4">
        <div class="w-1/2">
            <div class="minimal-card p-4">
                <h3 class="font-bold text-lg mb-2">Playlist Stats</h3>
                <div class="text-sm mb-1">
                    <i class="fas fa-list mr-1"></i>Total Jobs: <span class="font-semibold">${playlist.jobs.length}</span>
                </div>
                <div class="text-sm mb-1">
                    <i class="fas fa-users mr-1"></i>Total Players: <span class="font-semibold">${playlist.players?.length || 0}</span>
                </div>
                <div class="text-sm mb-3">
                    <i class="fas fa-trophy mr-1"></i>Total Points: <span class="font-semibold">${
                        playlist.stats?.reduce((total, stat) => {
                            const points = [15,12,10,8,7,6,5,4,3,2,1,0][stat.placement - 1] || 0;
                            return total + points;
                        }, 0) || 0
                    }</span>
                </div>
            </div>
        </div>
        <div class="w-1/2">
            <div class="minimal-card p-4">
                <div class="flex justify-end space-x-2 mb-4">
                    <button id="addJobsToPlaylist" class="minimal-btn">
                        <i class="fas fa-plus mr-2"></i>Add Jobs
                    </button>
                    <button id="managePlayersBtn" class="minimal-btn">
                        <i class="fas fa-users mr-2"></i>Manage Players
                    </button>
                </div>
                <div id="playlistJobs" class="grid grid-cols-1 gap-2">
                    ${playlist.jobs.map(job => `
                        <div class="job-card p-3 flex justify-between items-center">
                            <div>
                                <h3 class="font-semibold">${job.title}</h3>
                                <div class="text-sm text-muted">
                                    <span>${job.gameMode}</span> • 
                                    <span>${job.routeType}</span> • 
                                    <span>${job.routeLength}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm">Rating: ${job.rating}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
`;

// Modal Components
const CreatePlaylistModal = () => `
    <div id="createPlaylistModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="minimal-card p-6 w-96 shadow-xl">
            <h3 class="modal-title section-title text-2xl mb-4">Create New Playlist</h3>
            <input type="text" id="playlistName" placeholder="Playlist Name" class="input w-full mb-4">
            <div class="flex justify-end space-x-2">
                <button id="cancelCreate" class="btn bg-gray-300">Cancel</button>
                <button id="confirmCreate" class="btn">Create</button>
            </div>
        </div>
    </div>
`;

const AddJobsModal = () => `
    <div id="addJobsModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="minimal-card p-6 w-3/4 max-h-[80vh] shadow-xl overflow-hidden flex flex-col">
            <h3 class="section-title text-xl mb-4">Add Jobs to Playlist</h3>
            <div class="flex-1 overflow-y-auto mb-4">
                <div id="availableJobs" class="grid grid-cols-1 gap-4">
                    <!-- Available jobs will be inserted here -->
                </div>
            </div>
            <div class="flex justify-end space-x-2">
                <button id="cancelAddJobs" class="btn bg-gray-300">Cancel</button>
                <button id="confirmAddJobs" class="btn">Add Selected Jobs</button>
            </div>
        </div>
    </div>
`;

const UserSelectModal = () => `
    <div id="userSelectModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                    <button type="button" id="cancelUserSelect" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Select</button>
                </div>
            </form>
        </div>
    </div>
`;

const ManagePlayersModal = () => `
    <div id="managePlayersModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="minimal-card p-6 w-96 shadow-xl">
            <h3 class="section-title text-xl mb-4">Manage Players</h3>
            <form id="managePlayersForm" class="space-y-2 mb-4">
                <div id="playersCheckboxList"></div>
            </form>
            <div class="flex justify-end space-x-2">
                <button id="cancelManagePlayers" class="btn bg-gray-300">Cancel</button>
                <button id="saveManagePlayers" class="btn">Save</button>
            </div>
        </div>
    </div>
`;

// Stats Components
const StatsTable = (playlist, players) => {
    const pointsTable = [15,12,10,8,7,6,5,4,3,2,1,0];
    const playerTotals = {};
    players.forEach(player => { playerTotals[player] = 0; });

    // Calculate total points per player
    if (playlist.stats && playlist.stats.length) {
        playlist.stats.forEach(stat => {
            if (stat.username && playerTotals.hasOwnProperty(stat.username)) {
                let points = 0;
                if (stat.placement && stat.placement !== 'DNF' && stat.placement >= 1) {
                    points = pointsTable[stat.placement-1] !== undefined ? pointsTable[stat.placement-1] : 0;
                }
                playerTotals[stat.username] += points;
            }
        });
    }

    // Build player totals table
    let playerTotalsTable = `
        <table class='w-full text-xs mb-3'>
            <thead>
                <tr>
                    <th class='text-left'>Player</th>
                    <th class='text-right'>Total</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(playerTotals).map(([player, total]) => `
                    <tr>
                        <td>${player}</td>
                        <td class='text-right font-semibold'>${total}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Build race overview table
    let raceOverviewTable = `
        <table class='w-full text-xs'>
            <thead>
                <tr>
                    <th>Race</th>
                    ${players.map(player => `<th>${player}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${playlist.jobs.map(job => `
                    <tr>
                        <td class='font-semibold'>${job.title}</td>
                        ${players.map(player => {
                            const stat = (playlist.stats || []).find(s => s.username === player && s.jobUrl === job.url);
                            let cell = '';
                            if (stat) {
                                if (stat.placement === 'DNF' || stat.placement === 0) cell = 'DNF';
                                else if (stat.placement && stat.placement >= 1) {
                                    cell = pointsTable[stat.placement-1] !== undefined ? pointsTable[stat.placement-1] : 0;
                                }
                            }
                            return `<td class='text-center'>${cell}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    return `
        <div class='minimal-card p-4 h-fit w-full md:w-1/2'>
            <h3 class='font-bold text-lg mb-2'>Playlist Stats</h3>
            <div class='text-sm mb-1'>
                <i class='fas fa-list mr-1'></i>Total Jobs: <span class='font-semibold'>${playlist.jobs.length}</span>
            </div>
            <div class='text-sm mb-1'>
                <i class='fas fa-users mr-1'></i>Total Players: <span class='font-semibold'>${players.length}</span>
            </div>
            <div class='text-sm mb-3'>
                <i class='fas fa-trophy mr-1'></i>Total Points: <span class='font-semibold'>${
                    Object.values(playerTotals).reduce((a, b) => a + b, 0)
                }</span>
            </div>
            <div class='mb-3'>${playerTotalsTable}</div>
            <div>${raceOverviewTable}</div>
        </div>
    `;
};

// Export components
window.Components = {
    JobCard,
    JobCardCompact,
    PlaylistCard,
    PlaylistDetails,
    CreatePlaylistModal,
    AddJobsModal,
    UserSelectModal,
    ManagePlayersModal,
    StatsTable
}; 