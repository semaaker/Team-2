import { Router } from 'express';
import { messageController, sendMessageSchema } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const conversationRoutes = Router();

conversationRoutes.use(requireAuth);

conversationRoutes.get(
  '/',
  asyncHandler(async (req, res) => messageController.conversations(req, res)),
);

conversationRoutes.get(
  '/:id/messages',
  asyncHandler(async (req, res) => messageController.messages(req, res)),
);

conversationRoutes.post(
  '/:id/messages',
  validateBody(sendMessageSchema),
  asyncHandler(async (req, res) => messageController.send(req, res)),
);

conversationRoutes.patch(
  '/:id/read',
  asyncHandler(async (req, res) => messageController.markRead(req, res)),
);
