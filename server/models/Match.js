import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        index: true
    },
    team1: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    }],
    team2: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    }],
    score: {
        team1: {
            type: Number,
            required: true,
            min: 0
        },
        team2: {
            type: Number,
            required: true,
            min: 0
        }
    },
    winnerTeam: {
        type: Number,
        enum: [1, 2],
        required: true
    },
    completedAt: {
        type: Date,
        default: () => new Date()
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for query performance
MatchSchema.index({ groupId: 1, completedAt: -1 });

export default mongoose.model('Match', MatchSchema);
