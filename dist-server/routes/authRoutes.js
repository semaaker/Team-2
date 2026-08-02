import { Router } from 'express';
import { authController, forgotPasswordSchema, registerSchema, requestCodeSchema, verifyCodeSchema, } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const authRoutes = Router();
authRoutes.post('/request-code', validateBody(requestCodeSchema), asyncHandler(async (req, res) => authController.requestCode(req, res)));
authRoutes.post('/verify-code', validateBody(verifyCodeSchema), asyncHandler(async (req, res) => authController.verifyCode(req, res)));
authRoutes.post('/register', validateBody(registerSchema), asyncHandler(async (req, res) => authController.register(req, res)));
authRoutes.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(async (req, res) => authController.forgotPassword(req, res)));
authRoutes.get('/me', requireAuth, asyncHandler(async (req, res) => authController.me(req, res)));
authRoutes.post('/logout', asyncHandler(async (req, res) => authController.logout(req, res)));
//# sourceMappingURL=authRoutes.js.map