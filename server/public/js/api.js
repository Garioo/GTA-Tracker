// API client for GTA Race Tracker
const API = {
    baseUrl: 'http://GTA-Tracker-Droplet/api',

    // User endpoints
    users: {
        async create(username) {
            const response = await fetch(`${API.baseUrl}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            return response.json();
        },

        async getAll() {
            const response = await fetch(`${API.baseUrl}/users`);
            return response.json();
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
            return response.json();
        },

        async getAll() {
            try {
                console.log('Fetching jobs from:', `${API.baseUrl}/jobs`);
                const response = await fetch(`${API.baseUrl}/jobs`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
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
            return response.json();
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
            return response.json();
        },

        async getAll() {
            const response = await fetch(`${API.baseUrl}/playlists`);
            return response.json();
        },

        async getById(id) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}`);
            return response.json();
        },

        async updateName(id, name) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            return response.json();
        },

        async addJobs(id, jobs) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobs })
            });
            return response.json();
        },

        async removeJob(id, jobUrl) {
            const response = await fetch(`${API.baseUrl}/playlists/${id}/jobs/${encodeURIComponent(jobUrl)}`, {
                method: 'DELETE'
            });
            return response.json();
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
            return response.json();
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