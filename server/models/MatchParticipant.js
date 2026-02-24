import mongoose from 'mongoose';

const matchParticipantSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        index: true
    },
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true,
        index: true
    },
    team: {
        type: Number,
        enum: [1, 2],
        required: true
    },
    eloBefore: {
        type: Number,
        required: true
    },
    eloAfter: {
        type: Number,
        required: true
    },
    pointDifferential: {
        type: Number,
        default: 0
    },
    isWinner: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

// Compound indexes for fast querying by player or match
matchParticipantSchema.index({ playerId: 1, createdAt: -1 });
matchParticipantSchema.index({ groupId: 1, playerId: 1 });

const MatchParticipant = mongoose.model('MatchParticipant', matchParticipantSchema);

export default MatchParticipant;
