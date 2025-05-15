// Playlist-related logic
import { utils } from './utils.js';
import { state } from './state.js';
import * as Components from './components.js';
import { navigation } from './main.js';
import { modals } from './modals.js';

export const playlists = {
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
            document.getElementById('playlistsList').innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">No playlists available</p>
                    <button id="createPlaylistEmpty" class="btn mt-4">
                        <i class="fas fa-plus mr-2"></i>Create Playlist
                    </button>
                </div>
            `;
            document.getElementById('createPlaylistEmpty')?.addEventListener('click', modals.showCreatePlaylist);
            return;
        }
        document.getElementById('playlistsList').innerHTML = state.playlists.map(playlist => Components.PlaylistCard(playlist)).join('');
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
        const container = document.getElementById('playlistDetailsSection');
        container.innerHTML = Components.PlaylistDetails(state.currentPlaylist);
        document.getElementById('backToPlaylists')?.addEventListener('click', navigation.showPlaylists);
        document.getElementById('addJobsToPlaylist')?.addEventListener('click', modals.showAddJobs);
        document.getElementById('managePlayersBtn')?.addEventListener('click', modals.showManagePlayers);
    },
    removeJob: async (jobUrl) => {
        if (!state.currentPlaylist) return;
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
            const playlist = await API.playlists.create(name);
            state.playlists.push(playlist);
            playlists.render();
            return playlist;
        } catch (error) {
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
            if (playlist) playlist.name = newName;
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
            const result = await API.playlists.delete(id);
            if (result.success) {
                state.playlists = state.playlists.filter(p => p._id !== id);
                playlists.render();
                navigation.showPlaylists();
            } else {
                utils.showError(result.message || 'Failed to delete playlist');
            }
        } catch (error) {
            utils.showError('Failed to delete playlist: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    }
}; 