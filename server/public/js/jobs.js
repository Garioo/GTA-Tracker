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
    // ...renderCompact and other job logic will be moved here...
}; 