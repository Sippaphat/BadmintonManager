import express from 'express';
import * as playerController from '../controllers/playerController.js';
import { authenticate } from '../middleware/auth.js';
import { playerValidation } from '../middleware/validation.js';
import { upload, uploadErrorHandler } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Player CRUD (within a group)
router.post(
  '/:groupId/players',
  upload.single('photo'),
  uploadErrorHandler,
  playerValidation.create,
  playerController.addPlayer
);

router.get('/:groupId/players', playerController.getPlayers);

router.put(
  '/:groupId/players/:playerId',
  upload.single('photo'),
  uploadErrorHandler,
  playerValidation.update,
  playerController.updatePlayer
);

router.delete(
  '/:groupId/players/:playerId',
  playerValidation.delete,
  playerController.deletePlayer
);

// Player stats
router.get(
  '/:groupId/players/:playerId/statistics',
  playerController.getPlayerStatistics
);

router.patch(
  '/:groupId/players/:playerId/stats',
  playerValidation.updateStats,
  playerController.updatePlayerStats
);

router.post(
  '/:groupId/players/reset',
  playerValidation.resetStats,
  playerController.resetPlayerStats
);

// Player queries
router.get('/:groupId/players/leaderboard', playerController.getLeaderboard);
router.get('/:groupId/players/queue', playerController.getQueue);


// Player binding
router.post('/:groupId/players/:playerId/bind', playerController.bindPlayer);
router.post('/:groupId/players/:playerId/bind-self', playerController.bindSelf);
router.post('/:groupId/players/:playerId/unbind', playerController.unbindPlayer);

export default router;
