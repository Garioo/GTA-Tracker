const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3001;

// Website password (in production, use environment variable)
const WEBSITE_PASSWORD = 'gta123';

// Enable CORS for the extension
app.use(cors({
    origin: '*'
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (replace with a database in production)
let jobs = [];
let playlists = [];
let users = [];

// Verify website password middleware
const verifyPassword = (req, res, next) => {
    const password = req.headers['x-website-password'];
    if (password !== WEBSITE_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
    }
    next();
};

// Apply password protection to all routes except the test endpoint
app.use(verifyPassword);

// Test endpoint
app.get('/api', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Create or get user
app.post('/api/users', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    let user = users.find(u => u.username === username);
    if (!user) {
        user = {
            id: Date.now().toString(),
            username,
            createdAt: new Date()
        };
        users.push(user);
    }

    res.json(user);
});

// Get all users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// Save a job
app.post('/api/jobs', (req, res) => {
    const job = req.body;
    // Check if job already exists
    const existingJob = jobs.find(j => j.url === job.url);
    if (existingJob) {
        return res.status(400).json({ error: 'Job already exists' });
    }
    jobs.push(job);
    res.json({ success: true, job });
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
    res.json(jobs);
});

// Delete a job
app.delete('/api/jobs/:url', (req, res) => {
    const url = decodeURIComponent(req.params.url);
    const index = jobs.findIndex(j => j.url === url);
    if (index === -1) {
        return res.status(404).json({ error: 'Job not found' });
    }
    jobs.splice(index, 1);
    res.json({ success: true });
});

// Create a playlist
app.post('/api/playlists', verifyPassword, (req, res) => {
    const { name, userId } = req.body;
    if (!name || !userId) {
        return res.status(400).json({ error: 'Name and userId are required' });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const playlist = {
        id: Date.now().toString(),
        name,
        jobs: [],
        scores: {},
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    playlists.push(playlist);
    res.json(playlist);
});

// Get all playlists
app.get('/api/playlists', verifyPassword, (req, res) => {
    res.json(playlists);
});

// Get playlists by user
app.get('/api/playlists/user/:userId', verifyPassword, (req, res) => {
    const userPlaylists = playlists.filter(p => p.userId === req.params.userId);
    res.json(userPlaylists);
});

// Get playlist by ID
app.get('/api/playlists/:id', verifyPassword, (req, res) => {
    const playlist = playlists.find(p => p.id === req.params.id);
    if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
    }
    res.json(playlist);
});

// Update playlist name
app.put('/api/playlists/:id', verifyPassword, (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const playlist = playlists.find(p => p.id === req.params.id);
    if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
    }

    playlist.name = name;
    playlist.updatedAt = new Date();
    res.json(playlist);
});

// Add jobs to playlist
app.post('/api/playlists/:id/jobs', verifyPassword, (req, res) => {
    const { jobs } = req.body;
    if (!Array.isArray(jobs)) {
        return res.status(400).json({ error: 'Jobs must be an array' });
    }

    const playlist = playlists.find(p => p.id === req.params.id);
    if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
    }

    console.log('Adding jobs to playlist:', jobs);

    jobs.forEach(job => {
        if (!job.url) {
            console.log('Skipping job with missing URL:', job);
            return;
        }

        // Check if job already exists in playlist
        const existingJob = playlist.jobs.find(j => j.url === job.url);
        if (!existingJob) {
            playlist.jobs.push({
                url: job.url,
                title: job.title || 'Untitled Job',
                creator: job.creator || 'Unknown',
                rating: job.rating || 0,
                players: job.players || 0
            });
        }
    });

    playlist.updatedAt = new Date();
    console.log('Updated playlist:', playlist);
    res.json(playlist);
});

// Remove job from playlist
app.delete('/api/playlists/:id/jobs/:url', verifyPassword, (req, res) => {
    const playlist = playlists.find(p => p.id === req.params.id);
    if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
    }

    const jobUrl = decodeURIComponent(req.params.url);
    const jobIndex = playlist.jobs.findIndex(j => j.url === jobUrl);
    if (jobIndex === -1) {
        return res.status(404).json({ error: 'Job not found in playlist' });
    }

    playlist.jobs.splice(jobIndex, 1);
    playlist.updatedAt = new Date();
    res.json(playlist);
});

// Reorder jobs in playlist
app.post('/api/playlists/:id/reorder', verifyPassword, (req, res) => {
    const { fromIndex, toIndex } = req.body;
    if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
        return res.status(400).json({ error: 'fromIndex and toIndex are required' });
    }

    const playlist = playlists.find(p => p.id === req.params.id);
    if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
    }

    const job = playlist.jobs.splice(fromIndex, 1)[0];
    playlist.jobs.splice(toIndex, 0, job);
    playlist.updatedAt = new Date();
    res.json(playlist);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 