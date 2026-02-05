import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const CLIENT_ID = "634347628772-ot3d906un0ar1oq5p3b98tci67l99non.apps.googleusercontent.com"; // Replace with real Client ID
const client = new OAuth2Client(CLIENT_ID);
const JWT_SECRET = "123456789"; // Replace with environment variable for production

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// MongoDB Connection
mongoose.connect("mongodb+srv://pluemp_db_user:haKuhAcSWdNMxLgX@buddi.gunuse4.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    picture: String,
    googleId: String,
    createdAt: { type: Date, default: Date.now }
});

const PlayerSchema = new mongoose.Schema({
  name: String,
  photo: String, // URL/Path to photo
  playCount: { type: Number, default: 0 },
  winCount: { type: Number, default: 0 },
  baseSkill: { type: Number, default: 50 }, // 0-100
  elo: { type: Number, default: 1500 },
  gamesPlayed: { type: Number, default: 0 }, // Specific for ELO weight calculations
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
});

const GroupSchema = new mongoose.Schema({
  name: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who can access this group
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
});

const ScheduleSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  title: String,
  start: Date,
  end: Date,
  location: String,
  description: String
});

const User = mongoose.model('User', UserSchema);
const Player = mongoose.model('Player', PlayerSchema);
const Group = mongoose.model('Group', GroupSchema);
const Schedule = mongoose.model('Schedule', ScheduleSchema);

// Multer Config for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Routes

// --- Auth ---
app.post('/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        // Find or create user
        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = new User({
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                googleId: payload.sub
            });
            await user.save();
        }

        // Generate JWT
        const sessionToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token: sessionToken });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
});

// --- Groups ---
app.get('/groups', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
        // Fallback for non-authenticated requests (if any)
        const groups = await Group.find();
        return res.json(groups);
    }

    // Find groups where user is owner OR is in sharedWith
    const groups = await Group.find({
        $or: [
            { owner: userId },
            { sharedWith: userId }
        ]
    }).populate('owner', 'name email picture'); // Optional: show owner info
    
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/groups/:groupId/share', async (req, res) => {
    try {
        const { email } = req.body;
        const { groupId } = req.params;

        const userToShare = await User.findOne({ email });
        if (!userToShare) {
            return res.status(404).json({ error: 'User not found. They must sign in to the app first.' });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        // Check if already shared
        if (group.sharedWith.includes(userToShare._id)) {
            return res.status(400).json({ error: 'User already has access' });
        }
        
        // Check if owner
        if (group.owner && group.owner.toString() === userToShare._id.toString()) {
             return res.status(400).json({ error: 'User is the owner' });
        }

        group.sharedWith.push(userToShare._id);
        await group.save();

        res.json({ message: 'Shared successfully', user: userToShare });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/groups', async (req, res) => {
  try {
    const { name, userId } = req.body; // userId passed from frontend
    const newGroup = new Group({ name, owner: userId });
    await newGroup.save();
    res.json(newGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/groups/:groupId', async (req, res) => {
  try {
      const group = await Group.findById(req.params.groupId).populate('players');
      if (!group) return res.status(404).json({ error: 'Group not found' });
      res.json(group);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


// --- Players ---
// Add player to group with optional photo
app.post('/groups/:groupId/players', upload.single('photo'), async (req, res) => {
  try {
    const { name, baseSkill } = req.body;
    const { groupId } = req.params;
    let photoPath = '';

    if (req.file) {
      photoPath = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    }

    // Calculate initial Elo
    const validBase = baseSkill ? Number(baseSkill) : 50;
    const baseNorm = (validBase - 0) / (100 - 0);
    const seedElo = 1500 + (baseNorm - 0.5) * 400;

    const newPlayer = new Player({
      name,
      photo: photoPath,
      groupId,
      baseSkill: validBase,
      elo: seedElo,
      gamesPlayed: 0
    });
    await newPlayer.save();

    const group = await Group.findById(groupId);
    group.players.push(newPlayer._id);
    await group.save();

    res.json(newPlayer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/players/:id', async (req, res) => {
    try {
        const player = await Player.findByIdAndDelete(req.params.id);
        if (player) {
            // Also remove from group
            await Group.updateMany(
                { players: req.params.id },
                { $pull: { players: req.params.id } }
            );
        }
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/players/:id', upload.single('photo'), async (req, res) => {
    try {
        const { name, baseSkill } = req.body;
        const updateData = { name };
        if (baseSkill !== undefined) {
             updateData.baseSkill = Number(baseSkill);
        }
        if (req.file) {
            updateData.photo = `http://localhost:${PORT}/uploads/${req.file.filename}`;
        }
        
        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/players/:id/reset', async (req, res) => {
    // Reset play count and win count
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, { playCount: 0, winCount: 0 }, { new: true });
        res.json(updatedPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/players/:id/stats', async (req, res) => {
    try {
        const { playCount, winCount, elo, gamesPlayed } = req.body;
        const updateData = {};
        if (typeof playCount === 'number') updateData.playCount = playCount;
        if (typeof winCount === 'number') updateData.winCount = winCount;
        if (typeof elo === 'number') updateData.elo = elo;
        if (typeof gamesPlayed === 'number') updateData.gamesPlayed = gamesPlayed;
        
        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Schedules ---
app.get('/schedules', async (req, res) => {
    try {
        const { groupId } = req.query;
        const filter = groupId ? { groupId } : {};
        const schedules = await Schedule.find(filter).sort({ start: 1 });
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/schedules', async (req, res) => {
    try {
        const { groupId, title, start, end, location, description } = req.body;
        const newSchedule = new Schedule({
            groupId, title, start, end, location, description
        });
        await newSchedule.save();
        res.json(newSchedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/schedules/:id', async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
