import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Logo } from '@/components/ui';
import { authService } from '@/services';
import { useAuth, useToast } from '@/store';
import { validateLoginEmail, hasErrors, type FieldErrors } from '@/utils/validation';

/** Giriş — Adım 1: e-posta adresi alınır ve doğrulama kodu gönderilir. */
export function LoginEmailPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setPendingEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors<{ email: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateLoginEmail({ email });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setIsSubmitting(true);
    try {
      const result = await authService.requestCode(email.trim());
      setPendingEmail(result.email);

      // Demo ortamında kod ekranda gösterilir; üretimde e-posta ile gider.
      toast.success(
        result.devCode
          ? `Doğrulama kodunuz: ${result.devCode} (demo modu)`
          : 'Doğrulama kodu e-posta adresinize gönderildi.',
        'Kod gönderildi',
      );

      navigate('/giris/dogrulama');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kod gönderilemedi.';
      setErrors({ email: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="glass-card flex w-full flex-col items-center rounded-2xl p-8 md:p-12">
      <div className="mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
        <Logo size={56} hideWordmark />
      </div>

      <div className="mb-8 w-full text-center">
        <h1 className="mb-2 font-headline-md text-headline-md tracking-tight text-on-surface">
          Giriş Yap
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Devam etmek için e-posta adresinizi girin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6" noValidate>
        <Input
          label="E-posta Adresi"
          icon="mail"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="ornek@sirket.com"
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
          trailingIcon="arrow_forward"
          isLoading={isSubmitting}
          loadingText="Gönderiliyor..."
          className="btn-hover-effect h-12"
        >
          Devam Et
        </Button>
      </form>

      <div className="mt-8 w-full border-t border-surface-container-high pt-6 text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Hesabın yok mu?{' '}
          <Link
            to="/kayit"
            className="font-semibold text-primary-container transition-all hover:underline"
          >
            Hesap Oluştur
          </Link>
        </p>
        <Link
          to="/sifremi-unuttum"
          className="mt-3 inline-block font-label-sm text-label-sm text-secondary transition-colors hover:text-primary"
        >
          Şifremi Unuttum
        </Link>
      </div>
    </div>
  );
}
