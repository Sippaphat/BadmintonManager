import mongoose from 'mongoose';

const pairingHistorySchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        index: true
    },
    player1Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    player2Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    timesPartnered: {
        type: Number,
        default: 0
    },
    winsTogether: {
        type: Number,
        default: 0
    },
    timesOpposed: {
        type: Number,
        default: 0
    },
    p1Wins: {
        type: Number,
        default: 0
    },
    p2Wins: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create a compound index representing the pair uniquely regardless of order
// Always store player1Id as the alphabetically or numerically smaller ID to ensure uniqueness
pairingHistorySchema.index({ groupId: 1, player1Id: 1, player2Id: 1 }, { unique: true });
pairingHistorySchema.index({ player1Id: 1, player2Id: 1 });

// Helper to reliably find a pair's history document
pairingHistorySchema.statics.findByPair = function (groupId, p1, p2) {
    // Sort IDs to match the unique index constraint
    const ids = [p1.toString(), p2.toString()].sort();
    return this.findOne({
        groupId,
        player1Id: ids[0],
        player2Id: ids[1]
    });
};

const PairingHistory = mongoose.model('PairingHistory', pairingHistorySchema);

export default PairingHistory;
