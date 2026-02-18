import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  photo: String,
  playCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  winCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  baseSkill: { 
    type: Number, 
    default: 50,
    min: 0,
    max: 100
  },
  elo: { 
    type: Number, 
    default: 1500,
    min: 0
  },
  gamesPlayed: { 
    type: Number, 
    default: 0,
    min: 0
  },
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group',
    required: true,
    index: true
  },
  consecutiveGames: {
    type: Number,
    default: 0,
    min: 0
  },
  lastFinishTime: {
    type: Date,
    default: null
  },
  lastRestTime: {
    type: Date,
    default: () => new Date()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isResting: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
// Unique index only for active players (allows reusing names of deleted players)
PlayerSchema.index({ groupId: 1, name: 1 }, { 
  unique: true,
  partialFilterExpression: { isActive: true }
});
PlayerSchema.index({ groupId: 1, elo: -1 });
PlayerSchema.index({ groupId: 1, winCount: -1 });

// Virtual for win rate
PlayerSchema.virtual('winRate').get(function() {
  if (this.gamesPlayed === 0) return 0;
  return (this.winCount / this.gamesPlayed) * 100;
});

// Methods
PlayerSchema.methods.toJSON = function() {
  const player = this.toObject({ virtuals: true });
  delete player.__v;
  return player;
};

PlayerSchema.methods.updateStats = function(updates) {
  Object.assign(this, updates);
  return this.save();
};

PlayerSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  this.gamesPlayed += 1;
  this.consecutiveGames += 1;
  return this.save();
};

PlayerSchema.methods.recordWin = function() {
  this.winCount += 1;
  return this.save();
};

PlayerSchema.methods.recordRest = function() {
  this.consecutiveGames = 0;
  this.lastRestTime = new Date();
  return this.save();
};

PlayerSchema.methods.recordFinish = function() {
  this.lastFinishTime = new Date();
  return this.save();
};

// Statics
PlayerSchema.statics.findByGroup = function(groupId) {
  return this.find({ groupId, isActive: true }).sort({ createdAt: 1 });
};

PlayerSchema.statics.getLeaderboard = function(groupId, limit = 10) {
  return this.find({ groupId, isActive: true })
    .sort({ winCount: -1, elo: -1 })
    .limit(limit);
};

PlayerSchema.statics.getQueue = function(groupId) {
  return this.find({ groupId, isActive: true })
    .sort({ playCount: 1, lastFinishTime: 1 });
};

export default mongoose.model('Player', PlayerSchema);
