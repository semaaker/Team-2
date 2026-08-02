import { useState, type FormEvent } from 'react';
import { Button, Card, Icon, Input, Select, Textarea } from '@/components/ui';
import { contentService } from '@/services';
import { useAuth, useToast } from '@/store';
import { SUPPORT_CATEGORIES } from '@/utils/constants';
import { hasErrors, validateSupport, type FieldErrors, type SupportForm } from '@/utils/validation';

/**
 * Destek ve Denetim Merkezi.
 * Üç bölüm: iletişim kanalları, destek talep formu, algoritma denetimi.
 */
export function SupportPage() {
  const toast = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState<SupportForm>({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    subject: '',
    category: '',
    message: '',
  });
  const [errors, setErrors] = useState<FieldErrors<SupportForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  function update<K extends keyof SupportForm>(key: K, value: SupportForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateSupport(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      toast.error('Lütfen işaretli alanları kontrol edin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await contentService.createTicket(form);
      setReference(ticket.reference);
      setForm((prev) => ({ ...prev, subject: '', category: '', message: '' }));
      toast.success(`Talebiniz alındı. Referans no: ${ticket.reference}`, 'Teşekkürler');
    } catch (error) {
      const apiError = error as { message: string; fields?: Record<string, string> };
      if (apiError.fields) setErrors(apiError.fields as FieldErrors<SupportForm>);
      toast.error(apiError.message ?? 'Talep gönderilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <h1 className="mb-6 font-display-lg-mobile leading-tight text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">
        Destek ve Denetim Merkezi
      </h1>
      <p className="mb-12 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
        Sorularınız, teknik talepleriniz ve algoritma denetim başvurularınız için doğru yerdesiniz.
      </p>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {/* ------------------- 1. Teknik Destek ve İletişim ------------------- */}
        <Card className="flex flex-col gap-6">
          <div>
            <h2 className="mb-1 font-headline-md text-headline-md text-primary">
              1. Teknik Destek ve İletişim
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Destek ekibimiz hafta içi 09:00 - 18:00 saatleri arasında hizmet vermektedir.
            </p>
          </div>

          <ul className="space-y-4">
            <ContactRow icon="mail" label="E-posta" value="destek@sponsormatch.ai" />
            <ContactRow icon="schedule" label="Yanıt süresi" value="Ortalama 4 saat" />
            <ContactRow icon="support_agent" label="Öncelikli destek" value="Premium plan dahil" />
          </ul>

          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <p className="mb-2 font-label-md text-label-md font-semibold text-primary">
              Hızlı Çözümler
            </p>
            <ul className="space-y-1 font-body-md text-body-md text-on-surface-variant">
              <li>· Şifremi unuttum</li>
              <li>· Ödeme yöntemleri</li>
              <li>· Eşleşme kriterlerini güncelleme</li>
            </ul>
          </div>
        </Card>

        {/* ---------------------- 2. Destek Talep Formu ---------------------- */}
        <Card className="lg:col-span-2">
          <h2 className="mb-1 font-headline-md text-headline-md text-primary">
            2. Destek Talep Formu
          </h2>
          <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
            Talebinizi iletin; ekibimiz en kısa sürede dönüş yapsın.
          </p>

          {reference && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-success-bg p-4"
            >
              <Icon name="check_circle" size={20} className="mt-0.5 text-success" />
              <div>
                <p className="font-label-md text-label-md font-semibold text-success">
                  Talebiniz oluşturuldu
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Referans numaranız: <strong>{reference}</strong>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="Ad Soyad"
                icon="person"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                error={errors.fullName}
              />
              <Input
                label="E-posta Adresi"
                icon="mail"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                error={errors.email}
              />
              <Input
                label="Konu"
                icon="subject"
                placeholder="Talebinizi tek cümleyle özetleyin"
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
                error={errors.subject}
              />
              <Select
                label="Kategori"
                icon="category"
                options={SUPPORT_CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                }))}
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                error={errors.category}
              />
            </div>

            <Textarea
              label="Mesajınız"
              rows={5}
              placeholder="Yaşadığınız durumu, adımları ve varsa hata mesajını detaylandırın..."
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              error={errors.message}
            />

            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingText="Gönderiliyor..."
              trailingIcon="send"
            >
              Talebi Gönder
            </Button>
          </form>
        </Card>

        {/* ---------------- 3. Algoritma Denetimi ve Güvenlik ---------------- */}
        <Card className="lg:col-span-3">
          <h2 className="mb-1 font-headline-md text-headline-md text-primary">
            3. Algoritma Denetimi ve Güvenlik
          </h2>
          <p className="mb-6 max-w-3xl font-body-md text-body-md text-on-surface-variant">
            Eşleştirme algoritmamız düzenli olarak bağımsız denetimden geçer. Bir eşleşme sonucunun
            nasıl üretildiğini öğrenmek veya itiraz etmek için denetim talebi oluşturabilirsiniz.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AuditCard
              icon="policy"
              title="Şeffaflık Raporu"
              description="Skorlamada kullanılan sinyaller ve ağırlıkları çeyreklik olarak yayımlanır."
            />
            <AuditCard
              icon="balance"
              title="İtiraz Hakkı"
              description="Otomatik kararlara karşı insan incelemesi talep edebilirsiniz."
            />
            <AuditCard
              icon="lock"
              title="Veri Güvenliği"
              description="Kurumsal stratejileriniz üçüncü taraflarla paylaşılmaz, model eğitimi anonimdir."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3">
      <Icon name={icon} size={20} className="mt-0.5 text-primary-container" />
      <div>
        <p className="font-label-sm text-label-sm text-secondary">{label}</p>
        <p className="font-body-md text-body-md text-on-surface">{value}</p>
      </div>
    </li>
  );
}

function AuditCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-6">
      <Icon name={icon} size={24} className="mb-3 text-primary-container" />
      <h3 className="mb-2 font-headline-sm text-headline-sm text-primary">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>
    </div>
  );
}
