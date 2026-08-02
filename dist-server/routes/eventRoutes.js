import { Router } from 'express';
import multer from 'multer';
import { createEventSchema, eventController, updateProposalSchema, } from '../controllers/eventController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
/**
 * Dosya yüklemeleri bellekte tutulur — bu vitrin projesinde dosya kalıcı
 * olarak saklanmaz, yalnızca adı etkinlik kaydına işlenir. Gerçek dağıtımda
 * S3/GCS gibi bir nesne deposuna aktarılmalıdır.
 */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
export const eventRoutes = Router();
eventRoutes.get('/', optionalAuth, asyncHandler(async (req, res) => eventController.list(req, res)));
eventRoutes.get('/mine', requireAuth, asyncHandler(async (req, res) => eventController.listMine(req, res)));
eventRoutes.post('/', requireAuth, upload.single('sponsorDosyasi'), validateBody(createEventSchema), asyncHandler(async (req, res) => eventController.create(req, res)));
eventRoutes.get('/:id', optionalAuth, asyncHandler(async (req, res) => eventController.byId(req, res)));
eventRoutes.patch('/:id', requireAuth, asyncHandler(async (req, res) => eventController.update(req, res)));
eventRoutes.delete('/:id', requireAuth, asyncHandler(async (req, res) => eventController.remove(req, res)));
eventRoutes.post('/:id/bookmark', requireAuth, asyncHandler(async (req, res) => eventController.toggleBookmark(req, res)));
eventRoutes.get('/:id/proposals', optionalAuth, asyncHandler(async (req, res) => eventController.proposalsByEvent(req, res)));
/* ----------------------------- Teklif uçları ----------------------------- */
export const proposalRoutes = Router();
proposalRoutes.get('/recent', requireAuth, asyncHandler(async (req, res) => eventController.recentProposals(req, res)));
proposalRoutes.patch('/:id', requireAuth, validateBody(updateProposalSchema), asyncHandler(async (req, res) => eventController.updateProposal(req, res)));
//# sourceMappingURL=eventRoutes.js.map