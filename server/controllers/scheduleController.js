import { Schedule, Group } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Create a schedule
 * @route   POST /api/groups/:groupId/schedules
 * @access  Private
 */
export const createSchedule = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { date, time, location, maxPlayers, notes } = req.body;
  
  // Check group access
  const group = await Group.findById(groupId);
  
  if (!group) {
    throw new AppError('Group not found', 404);
  }
  
  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }
  
  // Create schedule
  const schedule = await Schedule.create({
    groupId,
    date: new Date(date),
    time,
    location: location || 'TBD',
    maxPlayers: maxPlayers || 12,
    notes: notes || '',
    createdBy: req.userId
  });
  
  res.status(201).json({
    success: true,
    schedule: schedule.toJSON()
  });
});

/**
 * @desc    Get schedules for a group
 * @route   GET /api/groups/:groupId/schedules
 * @access  Private
 */
export const getSchedules = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { startDate, endDate, upcoming } = req.query;
  
  // Check group access
  const group = await Group.findById(groupId);
  
  if (!group) {
    throw new AppError('Group not found', 404);
  }
  
  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }
  
  let query = { groupId, isActive: true };
  
  // Filter by date range
  if (startDate || endDate || upcoming === 'true') {
    query.date = {};
    
    if (upcoming === 'true') {
      // Only upcoming schedules
      query.date.$gte = new Date();
    } else {
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
  }
  
  const schedules = await Schedule.find(query)
    .populate('createdBy', 'name email picture')
    .populate('participants', 'name email picture')
    .sort({ date: 1, time: 1 });
  
  res.json({
    success: true,
    schedules: schedules.map(s => s.toJSON())
  });
});

/**
 * @desc    Get a single schedule
 * @route   GET /api/schedules/:scheduleId
 * @access  Private
 */
export const getScheduleById = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  
  const schedule = await Schedule.findById(scheduleId)
    .populate('groupId', 'name')
    .populate('createdBy', 'name email picture')
    .populate('participants', 'name email picture');
  
  if (!schedule || !schedule.isActive) {
    throw new AppError('Schedule not found', 404);
  }
  
  // Check group access
  const group = await Group.findById(schedule.groupId);
  
  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }
  
  res.json({
    success: true,
    schedule: schedule.toJSON()
  });
});

/**
 * @desc    Update a schedule
 * @route   PUT /api/schedules/:scheduleId
 * @access  Private
 */
export const updateSchedule = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const { date, time, location, maxPlayers, notes } = req.body;
  
  const schedule = await Schedule.findById(scheduleId);
  
  if (!schedule || !schedule.isActive) {
    throw new AppError('Schedule not found', 404);
  }
  
  // Check group access
  const group = await Group.findById(schedule.groupId);
  
  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }
  
  // Update fields
  if (date) schedule.date = new Date(date);
  if (time) schedule.time = time;
  if (location) schedule.location = location;
  if (maxPlayers) schedule.maxPlayers = maxPlayers;
  if (notes !== undefined) schedule.notes = notes;
  
  await schedule.save();
  
  res.json({
    success: true,
    schedule: schedule.toJSON()
  });
});

/**
 * @desc    Delete a schedule
 * @route   DELETE /api/schedules/:scheduleId
 * @access  Private
 */
export const deleteSchedule = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  
  const schedule = await Schedule.findById(scheduleId);
  
  if (!schedule) {
    throw new AppError('Schedule not found', 404);
  }
  
  // Check group access
  const group = await Group.findById(schedule.groupId);
  
  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }
  
  // Soft delete
  schedule.isActive = false;
  await schedule.save();
  
  res.json({
    success: true,
    message: 'Schedule deleted successfully'
  });
});

/**
 * @desc    Add participant to schedule
 * @route   POST /api/schedules/:scheduleId/participants
 * @access  Private
 */
export const addParticipant = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const { userId } = req.body;
  
  const schedule = await Schedule.findById(scheduleId);
  
  if (!schedule || !schedule.isActive) {
    throw new AppError('Schedule not found', 404);
  }
  
  // Check group access
  const group = await Group.findById(schedule.groupId);
  
  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }
  
  // Check if schedule is full
  if (schedule.participants.length >= schedule.maxPlayers) {
    throw new AppError('Schedule is full', 400);
  }
  
  const participantId = userId || req.userId;
  
  // Check if already participating
  if (schedule.participants.includes(participantId)) {
    throw new AppError('User already participating', 400);
  }
  
  // Add participant
  schedule.participants.push(participantId);
  await schedule.save();
  
  await schedule.populate('participants', 'name email picture');
  
  res.json({
    success: true,
    schedule: schedule.toJSON()
  });
});

/**
 * @desc    Remove participant from schedule
 * @route   DELETE /api/schedules/:scheduleId/participants/:userId
 * @access  Private
 */
export const removeParticipant = asyncHandler(async (req, res) => {
  const { scheduleId, userId } = req.params;
  
  const schedule = await Schedule.findById(scheduleId);
  
  if (!schedule || !schedule.isActive) {
    throw new AppError('Schedule not found', 404);
  }
  
  // Check group access (or if removing self)
  const group = await Group.findById(schedule.groupId);
  const isRemovingSelf = userId === req.userId.toString();
  
  if (!isRemovingSelf && !group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }
  
  // Remove participant
  schedule.participants = schedule.participants.filter(
    p => p.toString() !== userId
  );
  await schedule.save();
  
  await schedule.populate('participants', 'name email picture');
  
  res.json({
    success: true,
    schedule: schedule.toJSON()
  });
});

/**
 * @desc    Update schedule status (upcoming/completed/cancelled)
 * @route   PATCH /api/schedules/:scheduleId/status
 * @access  Private
 */
export const updateScheduleStatus = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const { status } = req.body;
  
  const schedule = await Schedule.findById(scheduleId);
  
  if (!schedule || !schedule.isActive) {
    throw new AppError('Schedule not found', 404);
  }
  
  // Check group access
  const group = await Group.findById(schedule.groupId);
  
  if (!group.hasAccess(req.userId)) {
    throw new AppError('Access denied', 403);
  }
  
  // Validate status
  const validStatuses = ['upcoming', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }
  
  schedule.status = status;
  await schedule.save();
  
  res.json({
    success: true,
    schedule: schedule.toJSON()
  });
});
