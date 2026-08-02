import { Router } from 'express';
import { contentController, supportTicketSchema } from '../controllers/contentController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/* --------------------------------- Hukuki --------------------------------- */

export const legalRoutes = Router();

legalRoutes.get(
  '/:slug',
  asyncHandler(async (req, res) => contentController.legal(req, res)),
);

/* --------------------------------- Destek --------------------------------- */

export const supportRoutes = Router();

supportRoutes.post(
  '/tickets',
  validateBody(supportTicketSchema),
  asyncHandler(async (req, res) => contentController.createTicket(req, res)),
);

/* ------------------------------ İstatistikler ------------------------------ */

export const statsRoutes = Router();

statsRoutes.get(
  '/platform',
  asyncHandler(async (req, res) => contentController.platformStats(req, res)),
);

statsRoutes.get(
  '/organizer',
  optionalAuth,
  asyncHandler(async (req, res) => contentController.organizerStats(req, res)),
);

statsRoutes.get(
  '/sponsor',
  optionalAuth,
  asyncHandler(async (req, res) => contentController.sponsorStats(req, res)),
);
