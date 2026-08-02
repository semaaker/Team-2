import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';
import { authService } from '@/services';
import { useAuth, useToast } from '@/store';
import { cn } from '@/utils/cn';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

/** Giriş — Adım 2: 6 haneli doğrulama kodu. */
export function LoginVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { pendingEmail, signIn, homePathFor } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // İlk kutuya odaklan.
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Tekrar gönder sayacı.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  // Adım 1 atlanmışsa e-posta ekranına geri gönder.
  if (!pendingEmail) return <Navigate to="/giris" replace />;

  const code = digits.join('');

  function setDigitAt(index: number, value: string) {
    setError(null);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, '').slice(-1);
    setDigitAt(index, value);
    if (value && index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      setDigitAt(index - 1, '');
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1)
      inputsRef.current[index + 1]?.focus();
  }

  /** Panodan yapıştırılan 6 haneli kodu kutulara dağıtır. */
  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((char, index) => {
      next[index] = char;
    });
    setDigits(next);
    setError(null);
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (code.length !== CODE_LENGTH) {
      setError('Lütfen 6 haneli kodun tamamını girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await authService.verifyCode(pendingEmail as string, code);
      signIn(session.user);
      toast.success(`Hoş geldiniz, ${session.user.fullName}.`, 'Giriş başarılı');

      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? homePathFor(session.user.role), { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kod doğrulanamadı.';
      setError(message);
      setDigits(Array(CODE_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    try {
      const result = await authService.requestCode(pendingEmail as string);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(
        result.devCode ? `Yeni kodunuz: ${result.devCode} (demo modu)` : 'Yeni kod gönderildi.',
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kod tekrar gönderilemedi.');
    }
  }

  return (
    <>
      <div className="flex flex-col gap-8 rounded-xl border border-surface-variant bg-surface-container-lowest p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 text-center">
          <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-on-primary">
            <Icon name="verified_user" size={28} />
          </span>
          <h1 className="font-headline-md text-headline-md text-primary">Doğrulama Kodu</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            <span className="font-semibold text-primary">{pendingEmail}</span> adresine gönderilen 6
            haneli kodu girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          <div className="flex justify-between gap-2 md:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputsRef.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                aria-label={`Kodun ${index + 1}. hanesi`}
                aria-invalid={Boolean(error) || undefined}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isSubmitting}
                className={cn(
                  'h-14 w-12 rounded-lg border bg-surface-container-lowest text-center font-headline-sm text-headline-sm text-primary transition-all duration-200 md:h-16 md:w-14',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  error ? 'border-error' : 'border-outline-variant',
                  'disabled:opacity-60',
                )}
              />
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-center justify-center gap-1 font-label-sm text-label-sm text-error"
            >
              <Icon name="error" size={14} />
              {error}
            </p>
          )}

          <div className="mt-2 flex flex-col gap-4">
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              loadingText="Doğrulanıyor..."
              className="bg-primary hover:bg-primary-container"
            >
              Doğrula ve Giriş Yap
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={handleResend}
              disabled={cooldown > 0}
              leadingIcon="refresh"
            >
              {cooldown > 0 ? `Kodu tekrar gönder (${cooldown}s)` : 'Kodu tekrar gönder'}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/giris"
          className="inline-flex items-center justify-center gap-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name="arrow_back" size={16} />
          Giriş sayfasına dön
        </Link>
      </div>
    </>
  );
}
