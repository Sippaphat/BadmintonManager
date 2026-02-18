import { Player, Group, User } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { getFileUrl } from '../middleware/upload.js';
import path from 'path';

/**
 * Calculate initial ELO from base skill
 */
const calculateInitialElo = (baseSkill = 50) => {
  const baseNorm = (baseSkill - 0) / (100 - 0);
  return 1500 + (baseNorm - 0.5) * 400;
};

/**
 * @desc    Add player to group
 * @route   POST /api/groups/:groupId/players
 * @access  Private
 */
export const addPlayer = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { name, baseSkill } = req.body;

  // Check group exists and user has access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  // Check if player with same name exists in group
  const existingPlayer = await Player.findOne({
    groupId,
    name: name.trim(),
    isActive: true
  });

  if (existingPlayer) {
    throw new AppError('Player with this name already exists in this group', 400);
  }

  // Get photo URL if uploaded
  let photoUrl = null;
  if (req.file) {
    photoUrl = getFileUrl(req.file.filename);
  }

  // Calculate initial ELO
  const skillValue = baseSkill ? parseInt(baseSkill) : 50;
  const initialElo = calculateInitialElo(skillValue);

  // Create player
  const player = await Player.create({
    name: name.trim(),
    photo: photoUrl,
    groupId,
    baseSkill: skillValue,
    elo: initialElo,
    gamesPlayed: 0
  });

  // Add player to group
  await group.addPlayer(player._id);

  res.status(201).json({
    success: true,
    player: player.toJSON()
  });
});

/**
 * @desc    Get all players in a group
 * @route   GET /api/groups/:groupId/players
 * @access  Private
 */
export const getPlayers = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  const players = await Player.findByGroup(groupId);

  res.json({
    success: true,
    players: players.map(p => p.toJSON())
  });
});

/**
 * @desc    Update player
 * @route   PUT /api/groups/:groupId/players/:playerId
 * @access  Private
 */
export const updatePlayer = asyncHandler(async (req, res) => {
  const { groupId, playerId } = req.params;
  const { name, baseSkill } = req.body;

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  // Find player
  const player = await Player.findOne({ _id: playerId, groupId, isActive: true });

  if (!player) {
    throw new AppError('Player not found', 404);
  }

  // Check for duplicate name
  if (name && name.trim() !== player.name) {
    const duplicate = await Player.findOne({
      groupId,
      name: name.trim(),
      _id: { $ne: playerId },
      isActive: true
    });

    if (duplicate) {
      throw new AppError('Player with this name already exists in this group', 400);
    }

    player.name = name.trim();
  }

  if (baseSkill !== undefined) {
    player.baseSkill = parseInt(baseSkill);
  }

  if (req.file) {
    player.photo = getFileUrl(req.file.filename);
  }

  await player.save();

  res.json({
    success: true,
    player: player.toJSON()
  });
});

/**
 * @desc    Update player stats
 * @route   PATCH /api/groups/:groupId/players/:playerId/stats
 * @access  Private
 */
export const updatePlayerStats = asyncHandler(async (req, res) => {
  const { groupId, playerId } = req.params;
  const { playCount, winCount, elo, gamesPlayed } = req.body;

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  // Find player
  const player = await Player.findOne({ _id: playerId, groupId, isActive: true });

  if (!player) {
    throw new AppError('Player not found', 404);
  }

  // Update stats
  const updates = {};
  if (typeof playCount === 'number') updates.playCount = playCount;
  if (typeof winCount === 'number') updates.winCount = winCount;
  if (typeof elo === 'number') updates.elo = elo;
  if (typeof gamesPlayed === 'number') updates.gamesPlayed = gamesPlayed;

  await player.updateStats(updates);

  res.json({
    success: true,
    player: player.toJSON()
  });
});

/**
 * @desc    Delete player
 * @route   DELETE /api/groups/:groupId/players/:playerId
 * @access  Private
 */
export const deletePlayer = asyncHandler(async (req, res) => {
  const { groupId, playerId } = req.params;

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  // Find and soft delete player
  const player = await Player.findOne({ _id: playerId, groupId });

  if (!player) {
    throw new AppError('Player not found', 404);
  }

  player.isActive = false;
  await player.save();

  // Remove from group
  await group.removePlayer(playerId);

  res.json({
    success: true,
    message: 'Player deleted successfully'
  });
});

/**
 * @desc    Reset player stats
 * @route   POST /api/groups/:groupId/players/reset
 * @access  Private
 */
export const resetPlayerStats = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { resetType = 'all' } = req.body;

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  const updates = {};

  if (resetType === 'all' || resetType === 'playCount') {
    updates.playCount = 0;
    updates.gamesPlayed = 0;
    updates.consecutiveGames = 0;
  }

  if (resetType === 'all' || resetType === 'winCount') {
    updates.winCount = 0;
  }

  await Player.updateMany(
    { groupId, isActive: true },
    updates
  );

  res.json({
    success: true,
    message: 'Player stats reset successfully'
  });
});

/**
 * @desc    Get player leaderboard
 * @route   GET /api/groups/:groupId/players/leaderboard
 * @access  Private
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { limit = 10 } = req.query;

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  const players = await Player.getLeaderboard(groupId, parseInt(limit));

  res.json({
    success: true,
    players: players.map(p => p.toJSON())
  });
});

/**
 * @desc    Get player queue (least played)
 * @route   GET /api/groups/:groupId/players/queue
 * @access  Private
 */
export const getQueue = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  const players = await Player.getQueue(groupId);

  res.json({
    success: true,
    players: players.map(p => p.toJSON())
  });
});

/**
 * @desc    Bind player to user account (Admin only)
 * @route   POST /api/groups/:groupId/players/:playerId/bind
 * @access  Private
 */
export const bindPlayer = asyncHandler(async (req, res) => {
  const { groupId, playerId } = req.params;
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Only owner can bind other users
  if (!group.owner.equals(req.userId)) {
    throw new AppError('Only group owner can bind players', 403);
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError('User with this email not found', 404);
  }

  // Find player
  const player = await Player.findOne({ _id: playerId, groupId, isActive: true });

  if (!player) {
    throw new AppError('Player not found', 404);
  }

  // Check if player is already bound
  if (player.userId) {
    throw new AppError('Player is already bound to a user', 400);
  }

  // Check if user is already bound to another player in this group
  const existingBinding = await Player.findOne({
    groupId,
    userId: user._id,
    isActive: true
  });

  if (existingBinding) {
    throw new AppError('User is already bound to another player in this group', 400);
  }

  player.userId = user._id;
  await player.save();

  res.json({
    success: true,
    player: player.toJSON(),
    message: `Player bound to ${user.name} (${user.email})`
  });
});

/**
 * @desc    Bind self to player
 * @route   POST /api/groups/:groupId/players/:playerId/bind-self
 * @access  Private
 */
export const bindSelf = asyncHandler(async (req, res) => {
  const { groupId, playerId } = req.params;

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }

  // Find player
  const player = await Player.findOne({ _id: playerId, groupId, isActive: true });

  if (!player) {
    throw new AppError('Player not found', 404);
  }

  // Check if player is already bound
  if (player.userId) {
    throw new AppError('Player is already bound to a user', 400);
  }

  // Check if current user is already bound to another player in this group
  const existingBinding = await Player.findOne({
    groupId,
    userId: req.userId,
    isActive: true
  });

  if (existingBinding) {
    throw new AppError('You are already bound to another player in this group', 400);
  }

  player.userId = req.userId;
  await player.save();

  res.json({
    success: true,
    player: player.toJSON(),
    message: 'Successfully bound to player'
  });
});

/**
 * @desc    Unbind player from user
 * @route   POST /api/groups/:groupId/players/:playerId/unbind
 * @access  Private
 */
export const unbindPlayer = asyncHandler(async (req, res) => {
  const { groupId, playerId } = req.params;

  // Check group access
  const group = await Group.findById(groupId);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Only owner can unbind
  if (!group.owner.equals(req.userId)) {
    throw new AppError('Only group owner can unbind players', 403);
  }

  // Find player
  const player = await Player.findOne({ _id: playerId, groupId, isActive: true });

  if (!player) {
    throw new AppError('Player not found', 404);
  }

  player.userId = null;
  await player.save();

  res.json({
    success: true,
    player: player.toJSON(),
    message: 'Player unbound successfully'
  });
});
