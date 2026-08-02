import { Router } from 'express';
import { notificationSchema, passwordSchema, profileSchema, settingsController, twoFactorSchema, } from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const settingsRoutes = Router();
settingsRoutes.use(requireAuth);
/* --------------------------------- Profil --------------------------------- */
settingsRoutes.get('/profile', asyncHandler(async (req, res) => settingsController.profile(req, res)));
settingsRoutes.patch('/profile', validateBody(profileSchema), asyncHandler(async (req, res) => settingsController.updateProfile(req, res)));
/* ------------------------------- Bildirimler ------------------------------- */
settingsRoutes.get('/notifications', asyncHandler(async (req, res) => settingsController.notifications(req, res)));
settingsRoutes.patch('/notifications', validateBody(notificationSchema), asyncHandler(async (req, res) => settingsController.updateNotifications(req, res)));
/* --------------------------------- Güvenlik -------------------------------- */
settingsRoutes.get('/security', asyncHandler(async (req, res) => settingsController.security(req, res)));
settingsRoutes.post('/security/password', validateBody(passwordSchema), asyncHandler(async (req, res) => settingsController.changePassword(req, res)));
settingsRoutes.patch('/security/two-factor', validateBody(twoFactorSchema), asyncHandler(async (req, res) => settingsController.setTwoFactor(req, res)));
settingsRoutes.delete('/security/sessions/:sessionId', asyncHandler(async (req, res) => settingsController.revokeSession(req, res)));
//# sourceMappingURL=settingsRoutes.js.map