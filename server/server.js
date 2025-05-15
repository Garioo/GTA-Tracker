const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const port = 3001;

// Enable CORS for the extension
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Basic health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Test endpoints
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const playlistCount = await Playlist.countDocuments();
        const jobCount = await Job.countDocuments();
        const userCount = await User.countDocuments();
        
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: mongoose.connection.db.databaseName,
            collections: {
                playlists: playlistCount,
                jobs: jobCount,
                users: userCount
            }
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ error: 'Database test failed', details: error.message });
    }
});

// Define Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});
const jobSchema = new mongoose.Schema({
  url: { type: String, unique: true },
  title: String,
  creator: String,
  rating: String,
  creationDate: String,
  lastUpdated: String,
  lastPlayed: String,
  players: String,
  teams: String,
  gameMode: String,
  routeType: String,
  routeLength: String,
  vehicleClasses: [String],
  locations: [String],
  // New meta fields from Excel
  raceId: String,
  date: String,
  type: String,
  name: String,
  time: String,
  laps: Number,
  checkpoints: Number,
  km: Number,
  notes: String
});
const playerStatSchema = new mongoose.Schema({
  username: String,
  jobUrl: String,
  placement: Number,
  lapTime: Number,
  dnf: Boolean,
  // New stat fields
  fastestLap: Boolean,
  slowestLap: Boolean,
  statNotes: String
}, { _id: false });
const playlistSchema = new mongoose.Schema({
  name: String,
  jobs: [{
    type: Object,
    _id: false
  }],
  stats: [playerStatSchema],
  players: [String],
  scores: {},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);

// Test endpoint
app.get('/api', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Create or get user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });
  let user = await User.findOne({ username });
  if (!user) {
    user = await User.create({ username });
  }
  res.json(user);
});

// Get all users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Save a job
app.post('/api/jobs', async (req, res) => {
  const job = req.body;
  try {
    const existingJob = await Job.findOne({ url: job.url });
    if (existingJob) return res.status(400).json({ error: 'Job already exists' });
    const newJob = await Job.create(job);
    res.json({ success: true, job: newJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

// Delete a job
app.delete('/api/jobs/:url', async (req, res) => {
  const url = decodeURIComponent(req.params.url);
  const result = await Job.deleteOne({ url });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Job not found' });
  res.json({ success: true });
});

// Create a playlist
app.post('/api/playlists', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const playlist = await Playlist.create({ name, jobs: [], stats: [], players: [] });
  res.json(playlist);
});

// Get all playlists
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find().lean();
    console.log('Found playlists:', playlists.length);
    res.json(playlists || []); // Ensure we always return an array
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists', details: error.message });
  }
});

// Get playlist by ID
app.get('/api/playlists/:id', async (req, res) => {
  try {
    // Add cache control headers
    res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
    
    const playlist = await Playlist.findById(req.params.id)
      .lean()
      .select('_id name jobs stats players scores createdAt updatedAt') // Only select needed fields
      .exec();
      
    if (!playlist) {
      console.log('Playlist not found:', req.params.id);
      return res.status(404).json({ 
        error: 'Playlist not found',
        message: 'The requested playlist does not exist'
      });
    }
    
    // Ensure the playlist has all required fields with minimal processing
    const safePlaylist = {
      _id: playlist._id,
      name: playlist.name || '',
      jobs: Array.isArray(playlist.jobs) ? playlist.jobs : [],
      stats: Array.isArray(playlist.stats) ? playlist.stats : [],
      players: Array.isArray(playlist.players) ? playlist.players : [],
      scores: playlist.scores || {},
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt
    };
    
    console.log('Found playlist:', safePlaylist._id, 'with', safePlaylist.jobs.length, 'jobs');
    res.json(safePlaylist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ 
      error: 'Failed to fetch playlist',
      details: error.message
    });
  }
});

// Update playlist name
app.put('/api/playlists/:id', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  playlist.name = name;
  playlist.updatedAt = new Date();
  await playlist.save();
  res.json(playlist);
});

// Delete playlist
app.delete('/api/playlists/:id', async (req, res) => {
  try {
    console.log('Attempting to delete playlist:', req.params.id);
    const result = await Playlist.deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) {
      console.log('Playlist not found:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        error: 'Playlist not found',
        message: 'The playlist may have been deleted already'
      });
    }
    
    console.log('Successfully deleted playlist:', req.params.id);
    res.json({ 
      success: true, 
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete playlist',
      message: error.message
    });
  }
});

// Add jobs to playlist
app.post('/api/playlists/:id/jobs', async (req, res) => {
  try {
    console.log('\n=== Adding Jobs to Playlist ===');
    console.log('Playlist ID:', req.params.id);
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    
    // Handle different request formats
    let jobs;
    if (Array.isArray(req.body)) {
      console.log('Received direct array of jobs');
      jobs = req.body;
    } else if (req.body.jobs) {
      console.log('Received jobs array in object');
      jobs = req.body.jobs;
    } else if (req.body.job) {
      console.log('Received single job in job field');
      jobs = [req.body.job];
    } else if (req.body.url) {
      console.log('Received single job object');
      jobs = [req.body];
    } else {
      console.error('Invalid request format:', req.body);
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Request must contain either a job object, jobs array, or array of jobs'
      });
    }
    
    console.log('Processed jobs array:', JSON.stringify(jobs, null, 2));

    // Validate jobs array
    if (jobs.length === 0) {
      console.error('Empty jobs array');
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Jobs array cannot be empty'
      });
    }

    // Validate each job has required fields
    for (const job of jobs) {
      console.log('Validating job:', JSON.stringify(job, null, 2));
      if (!job.url) {
        console.error('Job missing URL:', JSON.stringify(job, null, 2));
        return res.status(400).json({ 
          error: 'Invalid job data',
          message: 'Each job must have a URL'
        });
      }
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      console.error('Playlist not found:', req.params.id);
      return res.status(404).json({ 
        error: 'Playlist not found',
        message: 'The requested playlist does not exist'
      });
    }

    // Add new jobs, avoiding duplicates
    const existingUrls = new Set(playlist.jobs.map(j => j.url));
    const newJobs = jobs.filter(job => !existingUrls.has(job.url));
    
    if (newJobs.length > 0) {
      console.log('Adding new jobs:', JSON.stringify(newJobs, null, 2));
      playlist.jobs.push(...newJobs);
      playlist.updatedAt = new Date();
      await playlist.save();
      console.log(`Added ${newJobs.length} jobs to playlist ${playlist._id}`);
    } else {
      console.log('No new jobs to add - all jobs already exist in playlist');
    }

    res.json({
      success: true,
      playlist: {
        _id: playlist._id,
        name: playlist.name,
        jobs: playlist.jobs,
        updatedAt: playlist.updatedAt
      }
    });
  } catch (error) {
    console.error('Error adding jobs:', error);
    res.status(500).json({ 
      error: 'Failed to add jobs',
      details: error.message
    });
  }
});

// Remove job from playlist
app.delete('/api/playlists/:id/jobs/:url', async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  const jobUrl = decodeURIComponent(req.params.url);
  playlist.jobs = playlist.jobs.filter(j => j.url !== jobUrl);
  playlist.updatedAt = new Date();
  await playlist.save();
  res.json(playlist);
});

// Reorder jobs in playlist
app.post('/api/playlists/:id/reorder', async (req, res) => {
  const { fromIndex, toIndex } = req.body;
  if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
    return res.status(400).json({ error: 'fromIndex and toIndex are required' });
  }
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  const job = playlist.jobs.splice(fromIndex, 1)[0];
  playlist.jobs.splice(toIndex, 0, job);
  playlist.updatedAt = new Date();
  await playlist.save();
  res.json(playlist);
});

// Bulk stats endpoint
app.post('/api/playlists/:id/stats/bulk', async (req, res) => {
  const { stats } = req.body; // array of { username, jobUrl, placement, lapTime, dnf }
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  // Remove all stats for the jobs/users in the incoming array
  stats.forEach(stat => {
    playlist.stats = playlist.stats.filter(
      s => !(s.username === stat.username && s.jobUrl === stat.jobUrl)
    );
  });
  // Add all new stats
  playlist.stats.push(...stats);
  playlist.updatedAt = new Date();
  await playlist.save();
  res.json(playlist);
});

// User delete endpoint (and remove their stats from all playlists)
app.delete('/api/users/:username', async (req, res) => {
  const username = req.params.username;
  const result = await User.deleteOne({ username });
  // Remove user stats from all playlists
  await Playlist.updateMany({}, { $pull: { stats: { username } } });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true });
});

// Update players for a playlist
app.put('/api/playlists/:id/players', async (req, res) => {
  const { players } = req.body;
  if (!Array.isArray(players)) return res.status(400).json({ error: 'Players must be an array' });
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  playlist.players = players;
  playlist.updatedAt = new Date();
  await playlist.save();
  res.json(playlist);
});

// Update scores for a playlist
app.put('/api/playlists/:id/scores', async (req, res) => {
  try {
    const { scores } = req.body;
    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid scores data',
        message: 'Scores must be an object'
      });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ 
        error: 'Playlist not found',
        message: 'The requested playlist does not exist'
      });
    }

    // Update scores
    playlist.scores = scores;
    playlist.updatedAt = new Date();
    
    await playlist.save();
    console.log('Updated scores for playlist:', playlist._id);
    
    res.json({
      success: true,
      playlist: {
        _id: playlist._id,
        name: playlist.name,
        scores: playlist.scores,
        updatedAt: playlist.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating scores:', error);
    res.status(500).json({ 
      error: 'Failed to update scores',
      details: error.message
    });
  }
});

// MongoDB Atlas connection options
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority'
};

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Marius:y61C1M8iDn3hbbhr@gtatracker.jjongjz.mongodb.net/gta-tracker?retryWrites=true&w=majority&appName=GTATracker';

// Fix MongoDB indexes
mongoose.connection.on('connected', async () => {
  try {
    // Drop problematic index if it exists
    try {
      await mongoose.connection.db.collection('playlists').dropIndex('jobs.url_1');
      console.log('Dropped problematic index');
    } catch (err) {
      if (err.code !== 26) { // 26 is the error code for "namespace not found"
        console.error('Error dropping index:', err);
      }
    }

    // Create new indexes
    await Playlist.collection.createIndex({ _id: 1 });
    await Playlist.collection.createIndex({ 'jobs.url': 1 }, { unique: false });
    console.log('Created new indexes');
  } catch (err) {
    console.error('Error setting up indexes:', err);
  }
});

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI, mongoOptions)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas.');
        console.log('Connected to database:', mongoose.connection.db.databaseName);
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:', error);
        process.exit(1);
    });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB connection closure:', err);
        process.exit(1);
    }
});

// Update the server listen configuration
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('MongoDB connected:', mongoose.connection.readyState === 1 ? 'yes' : 'no');
}); 