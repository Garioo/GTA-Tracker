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
                // Add more specific error messages based on status code
                switch (response.status) {
                    case 400:
                        throw new Error('Invalid request: Please check the data and try again');
                    case 404:
                        throw new Error('Playlist not found: It may have been deleted already');
                    case 500:
                        throw new Error('Server error: Please try again later');
                    default:
                        throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
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
            try {
                const response = await fetch(`${API.baseUrl}/playlists/${id}`, {
                    method: 'DELETE'
                });
                
                // Handle 404 specifically for delete operations
                if (response.status === 404) {
                    console.log('Playlist not found:', id);
                    return { 
                        success: false, 
                        error: 'Playlist not found',
                        message: 'The playlist does not exist'
                    };
                }
                
                return API.handleResponse(response);
            } catch (error) {
                console.error('Delete error:', error);
                throw error;
            }
        },

        async addJob(id, jobs) {
            // Ensure jobs is an array
            const jobsArray = Array.isArray(jobs) ? jobs : [jobs];
            
            // Send the jobs array
            console.log('Sending jobs data:', jobsArray);
            const response = await fetch(`${API.baseUrl}/playlists/${id}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobs: jobsArray })
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