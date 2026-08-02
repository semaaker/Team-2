import { useState, type FormEvent } from 'react';
import { Button, Checkbox, Icon, Input, Modal, Select, Textarea } from '@/components/ui';
import { useToast } from '@/store';
import { eventService } from '@/services';
import { EVENT_CATEGORIES, PARTICIPANT_RANGES, SPONSOR_PACKAGES } from '@/utils/constants';
import { hasErrors, validateEvent, type FieldErrors, type EventForm } from '@/utils/validation';
import type { EventItem } from '@/types';

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Etkinlik oluşturulduğunda liste tazelensin diye çağrılır. */
  onCreated: (event: EventItem) => void;
}

const EMPTY_FORM: EventForm = {
  eventName: '',
  eventDate: '',
  eventCategory: '',
  participantCount: '',
  eventDescription: '',
  sponsorPackages: ['Altın', 'Gümüş'], // tasarımda varsayılan olarak işaretli
};

/**
 * "Yeni Etkinlik Ekle" modalı.
 *
 * Tasarımdaki alanların tamamını içerir ve dosya yüklemesi olduğu için
 * `multipart/form-data` ile `POST /api/events` ucuna gönderir.
 */
export function EventFormModal({ open, onClose, onCreated }: EventFormModalProps) {
  const toast = useToast();
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors<EventForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function togglePackage(name: string) {
    update(
      'sponsorPackages',
      form.sponsorPackages.includes(name)
        ? form.sponsorPackages.filter((item) => item !== name)
        : [...form.sponsorPackages, name],
    );
  }

  function reset() {
    setForm(EMPTY_FORM);
    setFile(null);
    setErrors({});
  }

  function handleClose() {
    if (isSubmitting) return;
    reset();
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateEvent(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      toast.error('Lütfen işaretli alanları kontrol edin.', 'Form eksik');
      return;
    }

    const formData = new FormData();
    formData.append('eventName', form.eventName);
    formData.append('eventDate', form.eventDate);
    formData.append('eventCategory', form.eventCategory);
    formData.append('participantCount', form.participantCount);
    formData.append('eventDescription', form.eventDescription);
    form.sponsorPackages.forEach((pkg) => formData.append('sponsorPackages', pkg));
    if (file) formData.append('sponsorDosyasi', file);

    setIsSubmitting(true);
    try {
      const created = await eventService.create(formData);
      toast.success(`"${created.name}" etkinliği oluşturuldu.`, 'Kaydedildi');
      onCreated(created);
      reset();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Etkinlik oluşturulamadı. Lütfen tekrar deneyin.';
      toast.error(message, 'Kaydedilemedi');

      // Sunucu alan bazlı hata döndüyse form üzerinde göster.
      const fields = (error as { fields?: Record<string, string> }).fields;
      if (fields) setErrors(fields as FieldErrors<EventForm>);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Yeni Etkinlik Ekle"
      description="SponsorMatch AI ağına yeni bir etkinlik tanımlayın."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            İptal Et
          </Button>
          <Button
            type="submit"
            form="add-event-form"
            isLoading={isSubmitting}
            loadingText="Kaydediliyor..."
            className="min-w-[150px]"
          >
            Etkinlik Oluştur
          </Button>
        </>
      }
    >
      <form id="add-event-form" onSubmit={handleSubmit} className="space-y-8 p-6 md:p-8" noValidate>
        {/* ------------------------------ Temel Bilgiler ------------------------------ */}
        <section className="space-y-6">
          <h3 className="border-b border-surface-container-highest pb-2 font-headline-sm text-headline-sm text-on-surface-variant">
            Temel Bilgiler
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Etkinlik Adı"
              icon="event"
              placeholder="Örn: Web3 Zirvesi 2026"
              value={form.eventName}
              onChange={(e) => update('eventName', e.target.value)}
              error={errors.eventName}
            />

            <Input
              label="Etkinlik Tarihi"
              icon="calendar_month"
              placeholder="Örn: 15-17 Ekim 2026"
              value={form.eventDate}
              onChange={(e) => update('eventDate', e.target.value)}
              error={errors.eventDate}
            />

            <Select
              label="Kategori"
              icon="category"
              options={EVENT_CATEGORIES.map((category) => ({ value: category, label: category }))}
              value={form.eventCategory}
              onChange={(e) => update('eventCategory', e.target.value)}
              error={errors.eventCategory}
            />

            <Select
              label="Beklenen Katılımcı Sayısı"
              icon="groups"
              options={PARTICIPANT_RANGES.map((range) => ({
                value: range.value,
                label: range.label,
              }))}
              value={form.participantCount}
              onChange={(e) => update('participantCount', e.target.value)}
              error={errors.participantCount}
            />
          </div>

          <Textarea
            label="Etkinlik Detayları"
            placeholder="Etkinliğinizin vizyonunu, hedef kitlesini ve ana temalarını kısaca özetleyin..."
            rows={4}
            value={form.eventDescription}
            onChange={(e) => update('eventDescription', e.target.value)}
            error={errors.eventDescription}
          />
        </section>

        {/* --------------------------- Sponsorluk & Dosyalar -------------------------- */}
        <section className="space-y-6">
          <h3 className="border-b border-surface-container-highest pb-2 font-headline-sm text-headline-sm text-on-surface-variant">
            Sponsorluk &amp; Dosyalar
          </h3>

          <div className="space-y-3">
            <p className="font-label-md text-label-md text-on-surface">Sponsorluk Paketleri</p>
            <p className="font-label-sm text-label-sm text-secondary">
              Sunulacak sponsorluk seviyelerini seçin.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {SPONSOR_PACKAGES.map((name) => (
                <Checkbox
                  key={name}
                  boxed
                  label={name}
                  checked={form.sponsorPackages.includes(name)}
                  onChange={() => togglePackage(name)}
                />
              ))}
            </div>

            {errors.sponsorPackages && (
              <p className="flex items-center gap-1 font-label-sm text-label-sm text-error">
                <Icon name="error" size={14} />
                {errors.sponsorPackages}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-4">
            <label
              htmlFor="sponsorDosyasi"
              className="block font-label-md text-label-md text-on-surface"
            >
              Etkinlik Dosyası (Sponsorluk Dosyası / Sunum)
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 py-3">
              <Icon name="upload_file" size={20} className="text-primary-container" />
              <input
                id="sponsorDosyasi"
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="flex-1 font-body-md text-body-md text-on-surface-variant file:mr-4 file:rounded-lg file:border-0 file:bg-primary-container file:px-4 file:py-2 file:font-label-md file:text-label-md file:text-on-primary hover:file:bg-primary"
              />
            </div>
            {file && (
              <p className="flex items-center gap-1 font-label-sm text-label-sm text-success">
                <Icon name="check_circle" size={14} />
                {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>
        </section>
      </form>
    </Modal>
  );
}
