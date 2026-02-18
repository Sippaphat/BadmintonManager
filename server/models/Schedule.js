import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema({
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group',
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  start: { 
    type: Date, 
    required: true,
    index: true
  },
  end: { 
    type: Date, 
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
ScheduleSchema.index({ groupId: 1, start: 1 });
ScheduleSchema.index({ groupId: 1, start: -1 });

// Validation
ScheduleSchema.pre('save', function(next) {
  if (this.end <= this.start) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Methods
ScheduleSchema.methods.toJSON = function() {
  const schedule = this.toObject();
  delete schedule.__v;
  return schedule;
};

// Statics
ScheduleSchema.statics.findByGroup = function(groupId, startDate, endDate) {
  const query = { groupId, isActive: true };
  
  if (startDate && endDate) {
    query.start = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(query).sort({ start: 1 });
};

ScheduleSchema.statics.getUpcoming = function(groupId, limit = 10) {
  return this.find({
    groupId,
    isActive: true,
    start: { $gte: new Date() }
  })
  .sort({ start: 1 })
  .limit(limit);
};

export default mongoose.model('Schedule', ScheduleSchema);
