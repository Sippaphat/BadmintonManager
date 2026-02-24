import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { recordMatch } from '../controllers/matchController.js';

const router = express.Router({ mergeParams: true });

// Require authentication for all matches routes
router.use('/:groupId/matches', authenticate);

// Routes for /api/groups/:groupId/matches
router.route('/:groupId/matches')
    .post(recordMatch);

export default router;
