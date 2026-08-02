import { useCallback, useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Icon,
  Input,
  LoadingState,
  Toggle,
} from '@/components/ui';
import { useQuery } from '@/hooks';
import { settingsService } from '@/services';
import { useToast } from '@/store';
import {
  hasErrors,
  validatePassword,
  type FieldErrors,
  type PasswordForm,
} from '@/utils/validation';

const EMPTY_PASSWORD: PasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

/** Ayarlar → Güvenlik: şifre değiştirme, 2FA, aktif oturumlar, güvenlik günlüğü. */
export function SecuritySettingsPage() {
  const toast = useToast();

  const fetcher = useCallback(() => settingsService.security(), []);
  const { data, isLoading, error, refetch, setData } = useQuery(fetcher);

  const [password, setPassword] = useState<PasswordForm>(EMPTY_PASSWORD);
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors<PasswordForm>>({});
  const [isChanging, setIsChanging] = useState(false);
  const [isTogglingTwoFactor, setIsTogglingTwoFactor] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  function updatePassword<K extends keyof PasswordForm>(key: K, value: string) {
    setPassword((prev) => ({ ...prev, [key]: value }));
    setPasswordErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();

    const errors = validatePassword(password);
    setPasswordErrors(errors);
    if (hasErrors(errors)) return;

    setIsChanging(true);
    try {
      await settingsService.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword(EMPTY_PASSWORD);
      toast.success('Şifreniz güncellendi.');
      refetch();
    } catch (err) {
      const apiError = err as { message: string; fields?: Record<string, string> };
      if (apiError.fields) setPasswordErrors(apiError.fields as FieldErrors<PasswordForm>);
      else setPasswordErrors({ currentPassword: apiError.message });
      toast.error(apiError.message ?? 'Şifre değiştirilemedi.');
    } finally {
      setIsChanging(false);
    }
  }

  async function handleTwoFactor(enabled: boolean) {
    setIsTogglingTwoFactor(true);
    try {
      const updated = await settingsService.setTwoFactor(enabled);
      setData(updated);
      toast.success(
        enabled ? 'İki adımlı doğrulama etkinleştirildi.' : 'İki adımlı doğrulama kapatıldı.',
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ayar güncellenemedi.');
    } finally {
      setIsTogglingTwoFactor(false);
    }
  }

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);
    try {
      const updated = await settingsService.revokeSession(sessionId);
      setData(updated);
      toast.success('Oturum sonlandırıldı.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Oturum sonlandırılamadı.');
    } finally {
      setRevokingId(null);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <LoadingState label="Güvenlik ayarları yükleniyor..." />
      </Card>
    );
  }

  if (error || !data) {
    return <ErrorState message={error?.message ?? 'Ayarlar alınamadı.'} onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-gutter">
      {/* ----------------------------- Şifre değiştir ----------------------------- */}
      <Card className="flex flex-col gap-6">
        <div>
          <h2 className="mb-1 font-headline-sm text-headline-sm text-primary">Şifre Değiştir</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Güçlü ve size özel bir şifre kullanın; en az 8 karakter önerilir.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5" noValidate>
          <Input
            label="Mevcut Şifre"
            icon="lock"
            type="password"
            autoComplete="current-password"
            value={password.currentPassword}
            onChange={(e) => updatePassword('currentPassword', e.target.value)}
            error={passwordErrors.currentPassword}
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Yeni Şifre"
              icon="key"
              type="password"
              autoComplete="new-password"
              value={password.newPassword}
              onChange={(e) => updatePassword('newPassword', e.target.value)}
              error={passwordErrors.newPassword}
            />
            <Input
              label="Yeni Şifre (Tekrar)"
              icon="key"
              type="password"
              autoComplete="new-password"
              value={password.confirmPassword}
              onChange={(e) => updatePassword('confirmPassword', e.target.value)}
              error={passwordErrors.confirmPassword}
            />
          </div>

          <Button type="submit" isLoading={isChanging} loadingText="Güncelleniyor...">
            Şifreyi Güncelle
          </Button>
        </form>
      </Card>

      {/* --------------------------------- 2FA --------------------------------- */}
      <Card>
        <Toggle
          label="İki Adımlı Doğrulama (2FA)"
          description="Girişlerde e-posta adresinize gönderilen tek kullanımlık kodla ek güvenlik katmanı ekleyin."
          checked={data.twoFactorEnabled}
          isPending={isTogglingTwoFactor}
          onChange={handleTwoFactor}
        />
      </Card>

      {/* ----------------------------- Aktif oturumlar ----------------------------- */}
      <Card className="flex flex-col gap-4">
        <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
          Aktif Oturumlar
        </h3>

        <ul className="divide-y divide-surface-variant">
          {data.sessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <Icon name="devices" size={20} className="mt-0.5 text-primary-container" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-primary">
                    {session.device}
                    {session.isCurrent && (
                      <Badge tone="success" pill>
                        Bu cihaz
                      </Badge>
                    )}
                  </p>
                  <p className="font-label-sm text-label-sm text-secondary">
                    {session.location} · {session.lastActiveLabel}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={revokingId === session.id}
                  onClick={() => handleRevoke(session.id)}
                  className="text-error hover:bg-error-container/40 hover:text-error"
                >
                  Sonlandır
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* ----------------------------- Güvenlik günlüğü ----------------------------- */}
      <Card className="flex flex-col gap-4">
        <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
          Güvenlik Günlüğü
        </h3>

        {data.log.length === 0 ? (
          <p className="py-6 text-center font-body-md text-body-md text-secondary">
            Kayıtlı güvenlik olayı yok.
          </p>
        ) : (
          <ul className="divide-y divide-surface-variant">
            {data.log.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-primary">{entry.action}</p>
                  <p className="font-label-sm text-label-sm text-secondary">{entry.detail}</p>
                </div>
                <span className="shrink-0 font-label-sm text-label-sm text-secondary">
                  {entry.dateLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
