import { useCallback, useState } from 'react';
import { Card, ErrorState, LoadingState, Select, Toggle } from '@/components/ui';
import { useQuery } from '@/hooks';
import { settingsService } from '@/services';
import { useToast } from '@/store';
import type { NotificationSettings } from '@/types';

const TOGGLES: { key: keyof NotificationSettings; label: string; description: string }[] = [
  {
    key: 'newProposal',
    label: 'Yeni bir sponsorluk teklifi geldiğinde',
    description: 'Etkinliklerinize gelen her yeni teklif için anında bildirim alın.',
  },
  {
    key: 'aiScoreUpdate',
    label: 'AI eşleşme skoru güncellendiğinde',
    description: 'Algoritma yeni veriyle skoru yeniden hesapladığında haberdar olun.',
  },
  {
    key: 'newMessage',
    label: 'Mesaj kutuma yeni bir mesaj düştüğünde',
    description: 'Sponsor ve organizatörlerden gelen mesajlar için bildirim.',
  },
  {
    key: 'productUpdates',
    label: 'Ürün güncellemeleri ve duyurular',
    description: 'Yeni özellikler ve platform duyuruları hakkında bilgilendirme.',
  },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
];

/** Ayarlar → Bildirim Tercihleri. Her değişiklik anında kaydedilir. */
export function NotificationSettingsPage() {
  const toast = useToast();

  const fetcher = useCallback(() => settingsService.notifications(), []);
  const { data, isLoading, error, refetch, setData } = useQuery(fetcher);

  const [pendingKey, setPendingKey] = useState<string | null>(null);

  /**
   * Anahtarı optimistic olarak çevirir, sunucuya yazar.
   * Hata durumunda eski değere döner ve kullanıcıyı bilgilendirir.
   */
  async function patch(key: keyof NotificationSettings, value: boolean | string) {
    if (!data) return;

    const previous = data;
    setData({ ...data, [key]: value } as NotificationSettings);
    setPendingKey(key);

    try {
      const updated = await settingsService.updateNotifications({ [key]: value });
      setData(updated);
    } catch (err) {
      setData(previous);
      toast.error(err instanceof Error ? err.message : 'Tercih kaydedilemedi.');
    } finally {
      setPendingKey(null);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <LoadingState label="Tercihler yükleniyor..." />
      </Card>
    );
  }

  if (error || !data) {
    return <ErrorState message={error?.message ?? 'Tercihler alınamadı.'} onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-gutter">
      <Card className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2 font-headline-md text-headline-md text-primary">
            Bildirim Tercihleri
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Hangi olaylarda bildirim almak istediğinizi seçin. Değişiklikler anında kaydedilir.
          </p>
        </div>

        <div className="divide-y divide-surface-variant">
          {TOGGLES.map((item) => (
            <div key={item.key} className="py-5 first:pt-0 last:pb-0">
              <Toggle
                label={item.label}
                description={item.description}
                checked={Boolean(data[item.key])}
                isPending={pendingKey === item.key}
                onChange={(checked) => patch(item.key, checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2 font-headline-sm text-headline-sm text-primary">E-posta Özetleri</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Etkinlik performansınızın ve yeni eşleşmelerin özetini e-posta ile alın.
          </p>
        </div>

        <Toggle
          label="Özet e-postaları gönderilsin"
          description="Kapatırsanız yalnızca işlemsel e-postalar (giriş, fatura) gönderilir."
          checked={data.weeklyDigest}
          isPending={pendingKey === 'weeklyDigest'}
          onChange={(checked) => patch('weeklyDigest', checked)}
        />

        <Select
          label="Gönderim sıklığı"
          icon="schedule"
          options={FREQUENCY_OPTIONS}
          value={data.digestFrequency}
          disabled={!data.weeklyDigest || pendingKey === 'digestFrequency'}
          onChange={(e) => patch('digestFrequency', e.target.value)}
          hint={
            data.weeklyDigest ? undefined : 'Sıklığı değiştirmek için önce özet e-postalarını açın.'
          }
        />
      </Card>
    </div>
  );
}
