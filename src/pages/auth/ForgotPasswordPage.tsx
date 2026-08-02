import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon, Input, Logo } from '@/components/ui';
import { authService } from '@/services';
import { useToast } from '@/store';
import { hasErrors, validateLoginEmail, type FieldErrors } from '@/utils/validation';

/** Şifre sıfırlama bağlantısı isteme ekranı. */
export function ForgotPasswordPage() {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors<{ email: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateLoginEmail({ email });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setIsSent(true);
      toast.success('Şifre sıfırlama bağlantısı gönderildi.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bağlantı gönderilemedi.';
      setErrors({ email: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full animate-fade-in rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-soft md:p-12">
      <div className="mb-8 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
          <Logo size={40} hideWordmark />
        </div>
      </div>

      <div className="mb-8 text-center">
        <h1 className="mb-2 font-headline-md text-headline-md text-on-surface">Şifremi Unuttum</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin.
        </p>
      </div>

      {isSent ? (
        // Başarı durumu — tasarımdaki yeşil onay geri bildiriminin karşılığı.
        <div className="animate-fade-in rounded-lg border border-emerald-200 bg-success-bg p-6 text-center">
          <Icon name="check_circle" size={32} className="mx-auto mb-3 text-success" />
          <p className="mb-2 font-label-md text-label-md font-semibold text-success">
            Bağlantı Gönderildi!
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            E-posta kutunuzu kontrol edin. Birkaç dakika içinde ulaşmazsa spam klasörüne bakın.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Input
            label="E-posta Adresi"
            icon="mail"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="ornek@alanadi.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({});
            }}
            error={errors.email}
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            trailingIcon="arrow_forward"
            isLoading={isSubmitting}
            loadingText="İşleniyor..."
          >
            Şifre Sıfırlama Bağlantısı Gönder
          </Button>
        </form>
      )}

      <div className="mt-10 border-t border-outline-variant pt-8 text-center">
        <Link
          to="/giris"
          className="group inline-flex items-center gap-1 font-label-md text-label-md text-secondary transition-colors hover:text-primary"
        >
          <Icon
            name="chevron_left"
            size={18}
            className="transition-transform group-hover:-translate-x-1"
          />
          Giriş Yap&apos;a Dön
        </Link>
      </div>
    </div>
  );
}
