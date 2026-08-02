import { api } from './apiClient';
import type { Invoice, PaymentMethod, Subscription } from '@/types';

/** Faturalandırma ve ödeme uçları. */
export const billingService = {
  subscription() {
    return api.get<Subscription>('/billing/subscription');
  },

  paymentMethod() {
    return api.get<PaymentMethod>('/billing/payment-method');
  },

  updatePaymentMethod(payload: {
    cardNumber: string;
    holderName: string;
    expiry: string;
    cvc: string;
  }) {
    return api.put<PaymentMethod>('/billing/payment-method', payload);
  },

  invoices() {
    return api.get<Invoice[]>('/billing/invoices');
  },
};
