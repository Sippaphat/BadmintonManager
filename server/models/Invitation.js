import mongoose from 'mongoose';

const InvitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        index: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Indexes for performance
InvitationSchema.index({ email: 1, groupId: 1, status: 1 });
InvitationSchema.index({ token: 1 });

// Methods
InvitationSchema.methods.toJSON = function () {
    const invitation = this.toObject();
    invitation.id = invitation._id;
    delete invitation._id;
    delete invitation.__v;
    return invitation;
};

// Statics
InvitationSchema.statics.findByToken = function (token) {
    return this.findOne({
        token,
        status: 'pending',
        expiresAt: { $gt: new Date() }
    }).populate('groupId');
};

export default mongoose.model('Invitation', InvitationSchema);
