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

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://Marius:y61C1M8iDn3hbbhr@gtatracker.jjongjz.mongodb.net/gta-tracker?retryWrites=true&w=majority&appName=GTATracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
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
  locations: [String]
});
const playlistSchema = new mongoose.Schema({
  name: String,
  jobs: [jobSchema],
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
  const playlist = await Playlist.create({ name, jobs: [], scores: {} });
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 