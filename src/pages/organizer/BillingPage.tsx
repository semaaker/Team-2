import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Icon,
  Input,
  LoadingState,
  ProgressBar,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableRow,
} from '@/components/ui';
import { PageHeader } from '@/components/features';
import { useQuery } from '@/hooks';
import { billingService } from '@/services';
import { useToast } from '@/store';
import { INVOICE_STATUS_LABELS } from '@/utils/constants';
import type { BadgeTone } from '@/components/ui';
import type { InvoiceStatus } from '@/types';

const INVOICE_COLUMNS = [
  { key: 'number', label: 'Fatura No' },
  { key: 'date', label: 'Tarih' },
  { key: 'description', label: 'Açıklama' },
  { key: 'amount', label: 'Tutar' },
  { key: 'status', label: 'Durum' },
  { key: 'actions', label: 'İşlem', align: 'right' as const },
] as const;

const STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
};

/** Faturalandırma ve Ödeme — plan, kullanım limitleri, ödeme yöntemi, fatura geçmişi. */
export function BillingPage() {
  const toast = useToast();

  const subscriptionFetcher = useCallback(() => billingService.subscription(), []);
  const subscription = useQuery(subscriptionFetcher);

  const paymentFetcher = useCallback(() => billingService.paymentMethod(), []);
  const payment = useQuery(paymentFetcher);

  const invoicesFetcher = useCallback(() => billingService.invoices(), []);
  const invoices = useQuery(invoicesFetcher);

  const [card, setCard] = useState({ cardNumber: '', holderName: '', expiry: '', cvc: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Kayıtlı kart bilgisi geldiğinde form sahibini önceden doldur.
  useEffect(() => {
    if (payment.data) {
      setCard((prev) => ({ ...prev, holderName: payment.data!.holderName }));
    }
  }, [payment.data]);

  async function handleSaveCard(event: FormEvent) {
    event.preventDefault();

    if (
      !card.cardNumber.trim() ||
      !card.holderName.trim() ||
      !card.expiry.trim() ||
      !card.cvc.trim()
    ) {
      toast.error('Tüm kart alanlarını doldurun.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await billingService.updatePaymentMethod(card);
      payment.setData(updated);
      setCard({ cardNumber: '', holderName: updated.holderName, expiry: '', cvc: '' });
      toast.success('Ödeme yönteminiz güncellendi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ödeme yöntemi güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col gap-8 px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <PageHeader
        title="Faturalandırma ve Ödeme"
        description="Plan bilgilerinizi görüntüleyin, ödeme yönteminizi güncelleyin ve fatura geçmişinizi indirin."
      />

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {/* ------------------------------ Plan kartı ------------------------------ */}
        <div className="lg:col-span-2">
          {subscription.isLoading && (
            <Card>
              <LoadingState label="Plan bilgisi yükleniyor..." />
            </Card>
          )}

          {subscription.error && !subscription.isLoading && (
            <ErrorState message={subscription.error.message} onRetry={subscription.refetch} />
          )}

          {subscription.data && (
            <Card className="flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline-md text-headline-md text-primary-container">
                    {subscription.data.planName}
                  </h2>
                  <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                    {subscription.data.billingCycle} · Yenileme: {subscription.data.renewsAt}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display-lg-mobile text-display-lg-mobile text-primary">
                    {subscription.data.priceLabel}
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {subscription.data.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 font-body-md text-body-md text-on-surface-variant"
                  >
                    <Icon name="check_circle" size={18} className="mt-0.5 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="border-t border-surface-variant pt-6">
                <h3 className="mb-6 font-label-md text-label-md font-bold uppercase tracking-wider text-secondary">
                  Kullanım Limitleri
                </h3>
                <div className="space-y-5">
                  {subscription.data.limits.map((limit) => (
                    <ProgressBar
                      key={limit.label}
                      label={`${limit.label} (${limit.used}/${limit.total})`}
                      value={(limit.used / limit.total) * 100}
                      showValue={false}
                    />
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* --------------------------- Ödeme yöntemi --------------------------- */}
        <Card className="flex flex-col gap-6">
          <h2 className="font-headline-sm text-headline-sm text-primary">
            Ödeme Yöntemini Güncelle
          </h2>

          {payment.data && (
            <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <Icon name="credit_card" size={24} className="text-primary-container" />
              <div>
                <p className="font-label-md text-label-md font-semibold text-primary">
                  {payment.data.brand} •••• {payment.data.last4}
                </p>
                <p className="font-label-sm text-label-sm text-secondary">
                  {payment.data.holderName} · Son kullanma {payment.data.expiry}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveCard} className="space-y-4" noValidate>
            <Input
              label="Kart Numarası"
              icon="credit_card"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={card.cardNumber}
              onChange={(e) => setCard((prev) => ({ ...prev, cardNumber: e.target.value }))}
            />
            <Input
              label="Kart Sahibi"
              icon="person"
              placeholder="Ad Soyad"
              value={card.holderName}
              onChange={(e) => setCard((prev) => ({ ...prev, holderName: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Son Kullanma"
                placeholder="AA/YY"
                value={card.expiry}
                onChange={(e) => setCard((prev) => ({ ...prev, expiry: e.target.value }))}
              />
              <Input
                label="CVC"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                value={card.cvc}
                onChange={(e) => setCard((prev) => ({ ...prev, cvc: e.target.value }))}
              />
            </div>

            <Button type="submit" fullWidth isLoading={isSaving} loadingText="Kaydediliyor...">
              Kartı Kaydet
            </Button>

            <p className="flex items-start gap-2 font-label-sm text-label-sm text-secondary">
              <Icon name="lock" size={14} className="mt-0.5" />
              Kart bilgileri banka seviyesinde şifreleme ile korunur.
            </p>
          </form>
        </Card>
      </div>

      {/* ----------------------------- Fatura geçmişi ----------------------------- */}
      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-surface-variant bg-inverse-on-surface px-6 py-5">
          <h2 className="font-headline-sm text-headline-sm text-primary">Fatura Geçmişi</h2>
        </div>

        {invoices.isLoading && <LoadingState label="Faturalar yükleniyor..." />}

        {invoices.error && !invoices.isLoading && (
          <div className="p-6">
            <ErrorState message={invoices.error.message} onRetry={invoices.refetch} />
          </div>
        )}

        {invoices.data && !invoices.isLoading && (
          <Table>
            <TableHead columns={INVOICE_COLUMNS} />
            <TableBody>
              {invoices.data.length === 0 ? (
                <TableEmpty colSpan={INVOICE_COLUMNS.length} message="Henüz faturanız yok." />
              ) : (
                invoices.data.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium text-primary">{invoice.number}</TableCell>
                    <TableCell className="text-on-surface-variant">{invoice.dateLabel}</TableCell>
                    <TableCell className="text-on-surface-variant">{invoice.description}</TableCell>
                    <TableCell className="font-medium">{invoice.amountLabel}</TableCell>
                    <TableCell>
                      <Badge tone={STATUS_TONE[invoice.status]} pill>
                        {INVOICE_STATUS_LABELS[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="ghost"
                        size="sm"
                        leadingIcon="download"
                        onClick={() =>
                          toast.info(`${invoice.number} numaralı fatura indiriliyor...`)
                        }
                      >
                        İndir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
