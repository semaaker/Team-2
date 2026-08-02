import { Router } from 'express';
import { billingController, paymentMethodSchema } from '../controllers/billingController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const billingRoutes = Router();

billingRoutes.use(requireAuth);

billingRoutes.get(
  '/subscription',
  asyncHandler(async (req, res) => billingController.subscription(req, res)),
);

billingRoutes.get(
  '/payment-method',
  asyncHandler(async (req, res) => billingController.paymentMethod(req, res)),
);

billingRoutes.put(
  '/payment-method',
  validateBody(paymentMethodSchema),
  asyncHandler(async (req, res) => billingController.updatePaymentMethod(req, res)),
);

billingRoutes.get(
  '/invoices',
  asyncHandler(async (req, res) => billingController.invoices(req, res)),
);
