import { Router } from 'express';
import { addNoteSchema, sponsorController } from '../controllers/sponsorController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const matchRoutes = Router();

matchRoutes.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => sponsorController.matches(req, res)),
);

export const sponsorshipRoutes = Router();

sponsorshipRoutes.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => sponsorController.sponsorships(req, res)),
);

export const milestoneRoutes = Router();

milestoneRoutes.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => sponsorController.milestones(req, res)),
);

export const dealRoutes = Router();

dealRoutes.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => sponsorController.deal(req, res)),
);

dealRoutes.post(
  '/:id/notes',
  requireAuth,
  validateBody(addNoteSchema),
  asyncHandler(async (req, res) => sponsorController.addNote(req, res)),
);

dealRoutes.patch(
  '/:id/deliverables/:deliverableId',
  requireAuth,
  asyncHandler(async (req, res) => sponsorController.toggleDeliverable(req, res)),
);

export const sponsorProfileRoutes = Router();

sponsorProfileRoutes.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => sponsorController.profile(req, res)),
);
