import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/index.js';
import { User, Invitation, Group } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const googleClient = new OAuth2Client(config.googleClientId);

/**
 * @desc    Authenticate user with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw new AppError('No credential provided', 400);
  }

  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleId: payload.sub
      });
      // Update last login
      await user.updateLastLogin();
    }

    // Check for pending invitations
    const pendingInvites = await Invitation.find({
      email: user.email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    for (const invite of pendingInvites) {
      const group = await Group.findById(invite.groupId);
      if (group && !group.hasAccess(user._id)) {
        await group.shareWithUser(user._id);
      }
      invite.status = 'accepted';
      await invite.save();
    }

    // Generate JWT
    const token = generateToken(user._id, user.email);

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      token
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    throw new AppError('Authentication failed', 401);
  }
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture
    }
  });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // This endpoint is mainly for consistency
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});
