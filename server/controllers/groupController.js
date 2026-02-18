import { Group, Player } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

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
