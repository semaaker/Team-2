import { Router } from 'express';
import { aiController, aiMatchSchema } from '../controllers/aiController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const aiRoutes = Router();
/** Hangi skorlama motorunun devrede olduğu — misafirlere de açık. */
aiRoutes.get('/status', (req, res) => aiController.status(req, res));
/** Eşleşmeleri yeniden hesaplar. Oturum varsa sponsorun profiliyle kişiselleşir. */
aiRoutes.post('/matches', optionalAuth, validateBody(aiMatchSchema), asyncHandler(async (req, res) => aiController.matches(req, res)));
/** Tek etkinliğin analizini yeniler ve depoya yazar. */
aiRoutes.post('/events/:id/analyze', requireAuth, asyncHandler(async (req, res) => aiController.analyzeEvent(req, res)));
//# sourceMappingURL=aiRoutes.js.map