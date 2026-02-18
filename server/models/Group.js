import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  sharedWith: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }],
  players: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player'
  }],
  settings: {
    defaultCourts: {
      type: Number,
      default: 2,
      min: 1,
      max: 10
    },
    defaultTargetScore: {
      type: Number,
      default: 21,
      min: 1,
      max: 50
    },
    defaultGameMode: {
      type: String,
      enum: ['singles', 'doubles'],
      default: 'doubles'
    }
  },
  isActive: {
    type: Boolean,
    default: true
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
GroupSchema.index({ owner: 1, createdAt: -1 });
GroupSchema.index({ sharedWith: 1 });
GroupSchema.index({ owner: 1, name: 1 });

// Virtual for player count
GroupSchema.virtual('playerCount').get(function() {
  return this.players.length;
});

// Methods
GroupSchema.methods.toJSON = function() {
  const group = this.toObject({ virtuals: true });
  delete group.__v;
  return group;
};

GroupSchema.methods.addPlayer = function(playerId) {
  if (!this.players.includes(playerId)) {
    this.players.push(playerId);
    return this.save();
  }
  return this;
};

GroupSchema.methods.removePlayer = function(playerId) {
  this.players = this.players.filter(id => !id.equals(playerId));
  return this.save();
};

GroupSchema.methods.shareWithUser = function(userId) {
  if (!this.sharedWith.includes(userId) && !this.owner.equals(userId)) {
    this.sharedWith.push(userId);
    return this.save();
  }
  return this;
};

GroupSchema.methods.unshareWithUser = function(userId) {
  this.sharedWith = this.sharedWith.filter(id => !id.equals(userId));
  return this.save();
};

GroupSchema.methods.hasAccess = function(userId) {
  return this.owner.equals(userId) || 
         this.sharedWith.some(id => id.equals(userId));
};

// Statics
GroupSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { sharedWith: userId }
    ],
    isActive: true
  }).sort({ createdAt: -1 });
};

GroupSchema.statics.findWithDetails = function(groupId) {
  return this.findById(groupId)
    .populate('owner', 'name email picture')
    .populate('sharedWith', 'name email picture')
    .populate('players');
};

export default mongoose.model('Group', GroupSchema);
