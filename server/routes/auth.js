import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authValidation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/google', authValidation.googleLogin, authController.googleLogin);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);

export default router;
