import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Avatar, Button, Card, ErrorState, Input, LoadingState } from '@/components/ui';
import { useQuery } from '@/hooks';
import { settingsService } from '@/services';
import { useAuth, useToast } from '@/store';
import type { ProfileSettings } from '@/types';

const EMPTY: ProfileSettings = {
  fullName: '',
  email: '',
  companyName: '',
  title: '',
  phone: '',
  avatarUrl: '',
};

/** Ayarlar → Profil Bilgileri. */
export function ProfileSettingsPage() {
  const toast = useToast();
  const { patchUser } = useAuth();

  const fetcher = useCallback(() => settingsService.profile(), []);
  const { data, isLoading, error, refetch, setData } = useQuery(fetcher);

  const [form, setForm] = useState<ProfileSettings>(EMPTY);
  const [isSaving, setIsSaving] = useState(false);

  // Sunucudan gelen veriyi forma yükle.
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const isDirty = data ? JSON.stringify(data) !== JSON.stringify(form) : false;

  function update<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.companyName.trim()) {
      toast.error('Ad Soyad ve Şirket Adı boş bırakılamaz.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await settingsService.updateProfile(form);
      setData(updated);
      setForm(updated);
      // Yan menüdeki ve üst navigasyondaki bilgileri de tazele.
      patchUser({
        fullName: updated.fullName,
        companyName: updated.companyName,
        title: updated.title,
        avatarUrl: updated.avatarUrl,
      });
      toast.success('Profil bilgileriniz güncellendi.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Profil güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <LoadingState label="Profil yükleniyor..." />
      </Card>
    );
  }

  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <Card className="flex flex-col gap-8">
      <div>
        <h2 className="mb-1 font-headline-md text-headline-md text-primary">Profil Bilgileri</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Bu bilgiler sponsorlara ve organizatörlere görünen kurumsal kimliğinizi oluşturur.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
        <Avatar name={form.fullName || 'Kullanıcı'} src={form.avatarUrl} size={64} />
        <div className="min-w-0 flex-1">
          <p className="font-label-md text-label-md font-semibold text-primary">Profil Fotoğrafı</p>
          <p className="mb-2 font-label-sm text-label-sm text-secondary">
            Kare bir görselin bağlantısını girin (PNG veya JPG).
          </p>
          <Input
            aria-label="Profil fotoğrafı bağlantısı"
            placeholder="https://..."
            value={form.avatarUrl}
            onChange={(e) => update('avatarUrl', e.target.value)}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="Ad Soyad"
            icon="person"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
          />
          <Input
            label="Unvan"
            icon="badge"
            placeholder="Örn: Organizatör Admin"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
          />
          <Input
            label="Şirket Adı"
            icon="business"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
          />
          <Input
            label="Telefon"
            icon="call"
            type="tel"
            placeholder="+90 5XX XXX XX XX"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>

        <Input
          label="E-posta Adresi"
          icon="mail"
          type="email"
          value={form.email}
          disabled
          hint="E-posta adresinizi değiştirmek için destek ekibiyle iletişime geçin."
        />

        <div className="flex items-center gap-3 border-t border-surface-variant pt-6">
          <Button
            type="submit"
            isLoading={isSaving}
            loadingText="Kaydediliyor..."
            disabled={!isDirty}
          >
            Değişiklikleri Kaydet
          </Button>
          {isDirty && (
            <Button variant="ghost" onClick={() => data && setForm(data)}>
              Geri Al
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
