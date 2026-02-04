import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

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
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
});

const Player = mongoose.model('Player', PlayerSchema);
const Group = mongoose.model('Group', GroupSchema);

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

// --- Groups ---
app.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/groups', async (req, res) => {
  try {
    const { name } = req.body;
    const newGroup = new Group({ name });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
