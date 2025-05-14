document.addEventListener("DOMContentLoaded", () => {
    const output = document.getElementById("output");
    const saveButton = document.getElementById("saveButton");
    const savedJobsList = document.getElementById("savedJobsList");
    const API_URL = 'http://localhost:3001/api';
    const WEBSITE_PASSWORD = 'gta123';
    output.innerText = "Loading...";

    // Helper function to add auth headers
    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-website-password': WEBSITE_PASSWORD
        };
    }

    // Helper function to show error
    function showError(message) {
        output.innerText = "❌ " + message;
        console.error(message);
    }

    // Load and display saved jobs
    async function loadSavedJobs() {
        try {
            const response = await fetch(`${API_URL}/jobs`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jobs = await response.json();
            
            savedJobsList.innerHTML = '';
            if (jobs.length === 0) {
                savedJobsList.innerHTML = '<div class="no-jobs">No saved jobs yet</div>';
                return;
            }
            
            jobs.forEach(job => {
                const jobElement = document.createElement('div');
                jobElement.className = 'saved-job';
                jobElement.innerHTML = `
                    <a href="${job.url}" target="_blank">${job.title}</a>
                    <span> by ${job.creator}</span>
                    <button onclick="removeJob('${job.url}')" style="float: right; color: red; border: none; background: none; cursor: pointer;">×</button>
                `;
                savedJobsList.appendChild(jobElement);
            });
        } catch (error) {
            showError('Error loading saved jobs: ' + error.message);
        }
    }

    // Remove a saved job
    window.removeJob = async (url) => {
        try {
            const response = await fetch(`${API_URL}/jobs/${encodeURIComponent(url)}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await loadSavedJobs();
        } catch (error) {
            showError('Error removing job: ' + error.message);
        }
    };

    // Save current job
    async function saveCurrentJob(jobData) {
        try {
            if (!jobData || !jobData.url) {
                throw new Error('Invalid job data');
            }

            const response = await fetch(`${API_URL}/jobs`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(jobData)
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            output.innerText = "✅ Job saved successfully";
            await loadSavedJobs();
        } catch (error) {
            showError('Error saving job: ' + error.message);
        }
    }

    // Load saved jobs on startup
    loadSavedJobs();

    // Handle active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length === 0) {
            showError('No active tab.');
            return;
        }

        const currentUrl = tabs[0].url;
        if (!currentUrl.includes("socialclub.rockstargames.com/job/gtav/")) {
            showError('Please open a GTA job page first.');
            return;
        }

        try {
            // Inject content script if not already injected
            await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ["content.js"]
            });

            // Wait a bit for the content script to initialize
            await new Promise(resolve => setTimeout(resolve, 100));

            // Request data from content script
            chrome.tabs.sendMessage(tabs[0].id, { type: "getJobData" }, (response) => {
                if (chrome.runtime.lastError) {
                    showError(chrome.runtime.lastError.message);
                    return;
                }
                
                if (!response) {
                    showError('Could not fetch data. Please refresh the page and try again.');
                    return;
                }

                try {
                    // Add URL to the job data
                    response.url = currentUrl;

                    // Update UI with job data
                    const fields = [
                        "title", "creator", "description", "rating", "creationDate",
                        "lastUpdated", "lastPlayed", "players", "teams", "gameMode",
                        "routeType", "routeLength", "vehicleClasses", "locations"
                    ];

                    fields.forEach(field => {
                        const element = document.getElementById(field);
                        if (element) {
                            if (Array.isArray(response[field])) {
                                element.innerText = response[field].join(", ") || "N/A";
                            } else {
                                element.innerText = response[field] || "N/A";
                            }
                        }
                    });
                    
                    // Enable save button and set up click handler
                    saveButton.disabled = false;
                    saveButton.onclick = () => saveCurrentJob(response);
                    
                    output.innerText = "✅ Data loaded successfully";
                } catch (error) {
                    showError('Error displaying data: ' + error.message);
                }
            });
        } catch (error) {
            showError('Error injecting content script: ' + error.message);
        }
    });
});
