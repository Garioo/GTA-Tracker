// Job-related logic
import { utils } from './utils.js';
import { state } from './state.js';
import * as Components from './components.js';

export const jobs = {
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
            document.getElementById('jobsList').innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">No jobs available</p>
                </div>
            `;
            return;
        }
        document.getElementById('jobsList').innerHTML = state.jobs.map(job => Components.JobCard(job)).join('');
    },
    renderCompact: (container, filter = null) => {
        if (!container) return;
        const playlistJobs = state.currentPlaylist?.jobs || [];
        // Filter out jobs that are already in the playlist
        let jobsToShow = state.jobs.filter(job => 
            !playlistJobs.some(playlistJob => 
                (playlistJob.url || '').trim().toLowerCase() === (job.url || '').trim().toLowerCase()
            )
        );
        
        if (filter === 'recentlyPlayed') {
            // Get the last played playlist from state
            const lastPlayedPlaylist = state.playlists
                .filter(p => p.lastPlayed)
                .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))[0];
            
            if (lastPlayedPlaylist) {
                // Show jobs from the last played playlist first
                jobsToShow.sort((a, b) => {
                    const aInLastPlaylist = lastPlayedPlaylist.jobs.some(j => j.url === a.url);
                    const bInLastPlaylist = lastPlayedPlaylist.jobs.some(j => j.url === b.url);
                    if (aInLastPlaylist && !bInLastPlaylist) return -1;
                    if (!aInLastPlaylist && bInLastPlaylist) return 1;
                    return 0;
                });
            }
        } else if (filter === 'mostPlayed') {
            jobsToShow.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
        } else if (filter === 'recentlyAdded') {
            jobsToShow.sort((a, b) => new Date(b.creationDate || 0) - new Date(a.creationDate || 0));
        }
        
        const selectedJobs = Array.from(state.selectedJobs.values());
        container.innerHTML = jobsToShow.map(job => {
            const selectedIndex = selectedJobs.findIndex(j => (j.url || '').trim().toLowerCase() === (job.url || '').trim().toLowerCase());
            return Components.JobCardCompact(job, null, selectedIndex >= 0 ? selectedIndex + 1 : null, false);
        }).join('');
        
        // Force reflow/repaint for Tailwind classes and browser rendering
        container.style.display = 'none';
        container.offsetHeight; // force reflow
        container.style.display = '';
        
        // Attach click event listeners to job cards
        container.querySelectorAll('.minimal-card[data-job-url]').forEach(card => {
            const jobUrl = card.getAttribute('data-job-url');
            const job = state.jobs.find(j => (j.url || '').trim().toLowerCase() === (jobUrl || '').trim().toLowerCase());
            if (job) {
                card.onclick = () => window.toggleJobSelection(card, job);
            }
        });
        
        // Update selected jobs count safely
        const selectedJobsCountElem = document.getElementById('selectedJobsCount');
        if (selectedJobsCountElem) {
            selectedJobsCountElem.textContent = selectedJobs.length;
        }
    },
}; 