import express from 'express';
import * as scheduleController from '../controllers/scheduleController.js';
import { authenticate } from '../middleware/auth.js';
import { scheduleValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Schedule CRUD
router.post(
  '/:groupId/schedules',
  scheduleValidation.create,
  scheduleController.createSchedule
);

router.get(
  '/:groupId/schedules',
  scheduleValidation.getByGroup,
  scheduleController.getSchedules
);

router.get(
  '/schedules/:scheduleId',
  scheduleValidation.delete,
  scheduleController.getScheduleById
);

router.put(
  '/schedules/:scheduleId',
  scheduleValidation.delete,
  scheduleController.updateSchedule
);

router.delete(
  '/schedules/:scheduleId',
  scheduleValidation.delete,
  scheduleController.deleteSchedule
);

// Participants management
router.post(
  '/schedules/:scheduleId/participants',
  scheduleValidation.delete,
  scheduleController.addParticipant
);

router.delete(
  '/schedules/:scheduleId/participants/:userId',
  scheduleValidation.delete,
  scheduleController.removeParticipant
);

// Status update
router.patch(
  '/schedules/:scheduleId/status',
  scheduleValidation.delete,
  scheduleController.updateScheduleStatus
);

export default router;
