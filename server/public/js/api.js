// API client for GTA Race Tracker
const API = {
    baseUrl: 'https://trackers.studio/api',

    // Helper function to handle API responses
    async handleResponse(response) {
        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || response.statusText);
            } catch (e) {
                if (errorText.includes('<!DOCTYPE html>')) {
                    throw new Error('Server error: Please try again later');
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        }
        return response.json();
    },

    // User endpoints
    users: {
        async create(username) {
            const response = await fetch(`${API.baseUrl}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            return API.handleResponse(response);
        },

        async getAll() {
            const response = await fetch(`${API.baseUrl}/users`);
            return API.handleResponse(response);
        }
    },

    // Job endpoints
    jobs: {
        async create(jobData) {
            const response = await fetch(`${API.baseUrl}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });
            return API.handleResponse(response);
        },

        async getAll() {
            try {
                console.log('Fetching jobs from:', `${API.baseUrl}/jobs`);
                const response = await fetch(`${API.baseUrl}/jobs`);
                const data = await API.handleResponse(response);
                console.log('Received jobs:', data);
                return data;
            } catch (error) {
                console.error('Error fetching jobs:', error);
                throw error;
            }
        },

        async delete(url) {
            const response = await fetch(`${API.baseUrl}/jobs/${encodeURIComponent(url)}`, {
                method: 'DELETE'
            });
            return API.handleResponse(response);
        }
    },

    // Playlist endpoints
    playlists: {
        async create(name) {
            const response = await fetch(`${API.baseUrl}/playlists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            return API.handleResponse(response);
        },

        async getAll() {
            const response = await fetch(`${API.baseUrl}/playlists`);
            return API.handleResponse(response);
        },

        async getById(id) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}`);
            return API.handleResponse(response);
        },

        async update(id, data) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return API.handleResponse(response);
        },

        async delete(id) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}`, {
                method: 'DELETE'
            });
            return API.handleResponse(response);
        },

        async addJob(id, jobUrl) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobUrl })
            });
            return API.handleResponse(response);
        },

        async removeJob(id, jobUrl) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}/jobs/${encodeURIComponent(jobUrl)}`, {
                method: 'DELETE'
            });
            return API.handleResponse(response);
        },

        async reorderJobs(id, fromIndex, toIndex) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromIndex, toIndex })
            });
            return response.json();
        },

        async updatePlayers(id, players) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}/players`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ players })
            });
            return API.handleResponse(response);
        },

        async updateStats(id, stats) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}/stats`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stats })
            });
            return response.json();
        }
    }
};

// Export the API client
window.API = API; 