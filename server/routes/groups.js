import express from 'express';
import * as groupController from '../controllers/groupController.js';
import { authenticate } from '../middleware/auth.js';
import { groupValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Group CRUD
router.get('/', groupController.getGroups);
router.post('/', groupValidation.create, groupController.createGroup);
router.get('/:groupId', groupValidation.getById, groupController.getGroupById);
router.delete('/:groupId', groupValidation.getById, groupController.deleteGroup);

// Group sharing
router.post('/:groupId/share', groupValidation.share, groupController.shareGroup);
router.delete('/:groupId/share/:userId', groupValidation.getById, groupController.unshareGroup);

// Group settings
router.patch('/:groupId/settings', groupValidation.getById, groupController.updateGroupSettings);

export default router;
