import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../data/db.js';

export const paymentMethodSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, ''))
    .refine((value) => /^\d{13,19}$/.test(value), 'Geçerli bir kart numarası girin.'),
  holderName: z.string().trim().min(3, 'Kart sahibinin adı zorunludur.'),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Son kullanma tarihi AA/YY biçiminde olmalıdır.'),
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, 'CVC 3 veya 4 haneli olmalıdır.'),
});

/** Kart markasını ilk haneden çıkarır. */
function detectBrand(cardNumber: string): string {
  if (cardNumber.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(cardNumber)) return 'Mastercard';
  if (/^3[47]/.test(cardNumber)) return 'American Express';
  if (/^9792/.test(cardNumber)) return 'Troy';
  return 'Kart';
}

export const billingController = {
  subscription(_req: Request, res: Response) {
    res.json(db.subscription);
  },

  paymentMethod(_req: Request, res: Response) {
    res.json(db.paymentMethod);
  },

  /**
   * Ödeme yöntemini günceller.
   *
   * Kart numarası ve CVC hiçbir zaman saklanmaz; yalnızca gösterim için
   * gerekli olan son 4 hane, marka ve son kullanma tarihi tutulur. Gerçek
   * dağıtımda bu adım bir ödeme sağlayıcısının tokenizasyon ucuna devredilir.
   */
  updatePaymentMethod(req: Request, res: Response) {
    const payload = req.body as z.infer<typeof paymentMethodSchema>;

    db.paymentMethod = {
      brand: detectBrand(payload.cardNumber),
      last4: payload.cardNumber.slice(-4),
      expiry: payload.expiry,
      holderName: payload.holderName,
    };

    res.json(db.paymentMethod);
  },

  invoices(_req: Request, res: Response) {
    res.json(db.invoices);
  },
};
