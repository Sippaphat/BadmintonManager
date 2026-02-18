import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: { 
    type: String, 
    required: true 
  },
  picture: String,
  googleId: { 
    type: String, 
    unique: true,
    sparse: true,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

// Methods
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  user.id = user._id;
  delete user._id;
  delete user.__v;
  return user;
};

UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.model('User', UserSchema);
