const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const port = 3001;

// Enable CORS for the extension
app.use(cors({
    origin: '*'
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection options
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/gta-tracker', mongoOptions)
    .then(() => {
        console.log('Successfully connected to MongoDB.');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
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
  jobs: [jobSchema],
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
  const playlists = await Playlist.find();
  res.json(playlists);
});

// Get playlist by ID
app.get('/api/playlists/:id', async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  res.json(playlist);
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

// Add jobs to playlist
app.post('/api/playlists/:id/jobs', async (req, res) => {
  const { jobs } = req.body;
  if (!Array.isArray(jobs)) return res.status(400).json({ error: 'Jobs must be an array' });
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  jobs.forEach(job => {
    if (!playlist.jobs.some(j => j.url === job.url)) {
      playlist.jobs.push(job);
    }
  });
  playlist.updatedAt = new Date();
  await playlist.save();
  res.json(playlist);
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 