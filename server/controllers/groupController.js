import { Group, User, Player, Invitation } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * @desc    Get all groups for current user
 * @route   GET /api/groups
 * @access  Private
 */
export const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.findByUser(req.userId);

  // Add isOwner flag
  const groupsWithOwnership = groups.map(group => ({
    ...group.toJSON(),
    isOwner: group.owner.equals(req.userId)
  }));

  res.json({
    success: true,
    groups: groupsWithOwnership
  });
});

/**
 * @desc    Create a new group
 * @route   POST /api/groups
 * @access  Private
 */
export const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const group = await Group.create({
    name,
    owner: req.userId
  });

  res.status(201).json({
    success: true,
    group: {
      ...group.toJSON(),
      isOwner: true
    }
  });
});

/**
 * @desc    Get group by ID with details
 * @route   GET /api/groups/:groupId
 * @access  Private
 */
export const getGroupById = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findWithDetails(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Check access
  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    group: {
      ...group.toJSON(),
      isOwner: group.owner._id.equals(req.userId)
    },
    players: group.players
  });
});

/**
 * @desc    Share group with another user
 * @route   POST /api/groups/:groupId/share
 * @access  Private
 */
export const shareGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.body;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Only owner can share
  if (!group.owner.equals(req.userId)) {
    throw new AppError('Only group owner can share', 403);
  }

  // Find user to share with
  const { User } = await import('../models/index.js');
  const userToShare = await User.findOne({ email: email.toLowerCase() });

  if (!userToShare) {
    throw new AppError('User not found. They must sign in to the app first.', 404);
  }

  // Check if already shared
  if (group.hasAccess(userToShare._id)) {
    throw new AppError('User already has access to this group', 400);
  }

  // Share group
  await group.shareWithUser(userToShare._id);

  res.json({
    success: true,
    message: 'Group shared successfully',
    sharedWith: {
      id: userToShare._id,
      name: userToShare.name,
      email: userToShare.email
    }
  });
});

/**
 * @desc    Unshare group with a user
 * @route   DELETE /api/groups/:groupId/share/:userId
 * @access  Private
 */
export const unshareGroup = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Only owner can unshare
  if (!group.owner.equals(req.userId)) {
    throw new AppError('Only group owner can unshare', 403);
  }

  await group.unshareWithUser(userId);

  res.json({
    success: true,
    message: 'Group unshared successfully'
  });
});

/**
 * @desc    Delete a group
 * @route   DELETE /api/groups/:groupId
 * @access  Private
 */
export const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Only owner can delete
  if (!group.owner.equals(req.userId)) {
    throw new AppError('Only group owner can delete', 403);
  }

  // Soft delete
  group.isActive = false;
  await group.save();

  // Also soft delete all players
  await Player.updateMany(
    { groupId },
    { isActive: false }
  );

  res.json({
    success: true,
    message: 'Group deleted successfully'
  });
});

/**
 * @desc    Update group settings
 * @route   PATCH /api/groups/:groupId/settings
 * @access  Private
 */
export const updateGroupSettings = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { defaultCourts, defaultTargetScore, defaultGameMode } = req.body;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Check access
  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  // Update settings
  if (defaultCourts !== undefined) group.settings.defaultCourts = defaultCourts;
  if (defaultTargetScore !== undefined) group.settings.defaultTargetScore = defaultTargetScore;
  if (defaultGameMode !== undefined) group.settings.defaultGameMode = defaultGameMode;

  await group.save();

  res.json({
    success: true,
    group: group.toJSON()
  });
});

/**
 * @desc    Send invitation to email
 * @route   POST /api/groups/:groupId/invite
 * @access  Private
 */
export const sendInvitation = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Only owner can invite
  if (!group.owner.equals(req.userId)) {
    throw new AppError('Only group owner can invite', 403);
  }

  // Check if email is already a member
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser && group.hasAccess(existingUser._id)) {
    throw new AppError('User is already a member of this group', 400);
  }

  // Check pending invitations
  const existingInvite = await Invitation.findOne({
    email: email.toLowerCase(),
    groupId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });

  if (existingInvite) {
    throw new AppError('An active invitation already exists for this email', 400);
  }

  // Create invitation
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await Invitation.create({
    email: email.toLowerCase(),
    groupId,
    invitedBy: req.userId,
    token,
    expiresAt
  });

  // Send email
  const inviteLink = `${config.apiBaseUrl.replace('/api', '')}/invite?token=${token}`; // Frontend URL

  await sendEmail({
    to: email,
    subject: `Invitation to join ${group.name} on Badminton Manager`,
    html: `
      <h1>You've been invited!</h1>
      <p>You have been invited to join the group <strong>${group.name}</strong> on Badminton Manager.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Join Group</a>
      <p>Or copy this link: ${inviteLink}</p>
      <p>This link will expire in 7 days.</p>
    `
  });

  res.json({
    success: true,
    message: `Invitation sent to ${email}`
  });
});

/**
 * @desc    Accept invitation
 * @route   POST /api/groups/invitations/accept
 * @access  Private
 */
export const acceptInvitation = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Token is required', 400);
  }

  const invitation = await Invitation.findByToken(token);

  if (!invitation) {
    throw new AppError('Invalid or expired invitation token', 400);
  }

  // Check if current user email matches invitation
  const user = await User.findById(req.userId);
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new AppError('This invitation belongs to a different email address', 403);
  }

  const group = invitation.groupId;

  // Add user to group if not already added
  if (!group.hasAccess(user._id)) {
    await group.shareWithUser(user._id);
  }

  // Mark invitation as accepted
  invitation.status = 'accepted';
  await invitation.save();

  res.json({
    success: true,
    message: `Successfully joined ${group.name}`,
    groupId: group._id
  });
});
