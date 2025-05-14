// Initialize the content script
console.log("GTA Job Info content script loaded");

// Add a visible message to the page
const debugDiv = document.createElement('div');
debugDiv.style.position = 'fixed';
debugDiv.style.top = '10px';
debugDiv.style.right = '10px';
debugDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
debugDiv.style.color = 'white';
debugDiv.style.padding = '10px';
debugDiv.style.borderRadius = '5px';
debugDiv.style.zIndex = '9999';
debugDiv.style.fontSize = '12px';
debugDiv.style.display = 'none';
document.body.appendChild(debugDiv);

// Function to extract job data
function extractJobData() {
    const getText = (selector) => {
        try {
            const el = document.querySelector(selector);
            return el ? el.textContent.trim() : "N/A";
        } catch (error) {
            console.error(`Error getting text for ${selector}:`, error);
            return "N/A";
        }
    };

    const getStat = (label) => {
        try {
            const statRow = Array.from(document.querySelectorAll(".Ugc__statRow__k9Yc3"))
                .find(row => row.innerText.includes(label));
            return statRow ? statRow.querySelector(".Ugc__statValue__RdbaV")?.textContent.trim() || "N/A" : "N/A";
        } catch (error) {
            console.error(`Error getting stat for ${label}:`, error);
            return "N/A";
        }
    };

    const getTags = (label) => {
        try {
            const section = Array.from(document.querySelectorAll(".Ugc__statRowStack__GgBdj"))
                .find(div => div.innerText.includes(label));
            return section
                ? Array.from(section.querySelectorAll(".markedText")).map(el => el.textContent.trim())
                : [];
        } catch (error) {
            console.error(`Error getting tags for ${label}:`, error);
            return [];
        }
    };

    try {
        // Get title and creator from the page title
        const fullTitle = document.title;
        console.log("Full title:", fullTitle);

        // Extract title (everything before " by ")
        const title = fullTitle.split(" by ")[0] || "N/A";

        // Extract creator (between " by " and " in ")
        let creator = "N/A";
        if (fullTitle.includes(" by ") && fullTitle.includes(" in ")) {
            const parts = fullTitle.split(" by ")[1].split(" in ");
            if (parts.length > 0) {
                creator = parts[0].trim();
            }
        }

        const data = {
            title,
            creator,
            description: getText(".Ugc__description__gKjFJ"),
            rating: getStat("Rating"),
            creationDate: getStat("Creation Date"),
            lastUpdated: getStat("Last Updated"),
            lastPlayed: getStat("Last Played"),
            players: getStat("Players"),
            teams: getStat("Teams"),
            gameMode: getStat("Game Mode"),
            routeType: getStat("Route Type"),
            routeLength: getStat("Route Length"),
            vehicleClasses: getTags("Vehicle Classes"),
            locations: getTags("Location")
        };

        console.log("Extracted data:", data);
        return data;
    } catch (error) {
        console.error("Error extracting job data:", error);
        throw error;
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        debugDiv.style.display = 'block';
        debugDiv.textContent = 'Received message: ' + request.type;
        
        if (request.type === "getJobData") {
            const data = extractJobData();
            console.log("Sending data to popup:", data);
            sendResponse(data);
        }
    } catch (error) {
        console.error("Error handling message:", error);
        debugDiv.textContent = 'Error: ' + error.message;
        sendResponse(null);
    }
    return true;
});
