import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Icon, Input } from '@/components/ui';
import { authService } from '@/services';
import { useAuth, useToast } from '@/store';
import { cn } from '@/utils/cn';
import { APP_NAME } from '@/utils/constants';
import {
  hasErrors,
  validateRegister,
  type FieldErrors,
  type RegisterForm,
} from '@/utils/validation';
import type { UserRole } from '@/types';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: string }[] = [
  {
    value: 'organizer',
    label: 'Organizatör',
    description: 'Etkinlik düzenliyorum, sponsor arıyorum.',
    icon: 'campaign',
  },
  {
    value: 'sponsor',
    label: 'Sponsor',
    description: 'Marka olarak etkinlik sponsoru olmak istiyorum.',
    icon: 'handshake',
  },
];

const EMPTY_FORM: RegisterForm = {
  fullName: '',
  companyName: '',
  email: '',
  password: '',
  role: 'organizer',
};

/** Yeni kurumsal hesap oluşturma ekranı. */
export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signIn, homePathFor } = useAuth();

  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<RegisterForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateRegister(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      toast.error('Lütfen işaretli alanları kontrol edin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await authService.register({
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role as UserRole,
      });

      signIn(session.user);
      toast.success(`${APP_NAME} ağına hoş geldiniz.`, 'Hesabınız oluşturuldu');
      navigate(homePathFor(session.user.role), { replace: true });
    } catch (error) {
      const apiError = error as { message: string; fields?: Record<string, string> };
      if (apiError.fields) setErrors(apiError.fields as FieldErrors<RegisterForm>);
      toast.error(apiError.message ?? 'Hesap oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-headline-md text-headline-md text-primary">{APP_NAME}</h1>
        <p className="font-body-md text-body-md text-secondary">
          Profesyonel sponsorluk ağınıza katılın.
        </p>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft md:p-8">
        <div className="mb-8">
          <h2 className="mb-2 font-headline-md text-headline-md text-on-surface">
            Yeni Hesap Oluştur
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {APP_NAME} dünyasına katılmak için bilgilerinizi girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Input
            label="Ad Soyad"
            icon="person"
            name="fullName"
            autoComplete="name"
            placeholder="John Doe"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            error={errors.fullName}
          />

          <Input
            label="Şirket Adı"
            icon="business"
            name="companyName"
            autoComplete="organization"
            placeholder="SponsorMatch Inc."
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            error={errors.companyName}
          />

          <Input
            label="E-posta Adresi"
            icon="mail"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="ornek@sirketiniz.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
          />

          <Input
            label="Şifre"
            icon="lock"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
            hint="En az 8 karakter kullanın."
          />

          {/* Hesap türü — yönlendirilecek panel bu seçime göre belirlenir. */}
          <fieldset className="space-y-2">
            <legend className="mb-2 font-label-md text-label-md text-on-surface">Hesap Türü</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ROLE_OPTIONS.map((option) => {
                const isSelected = form.role === option.value;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
                      isSelected
                        ? 'border-primary-container bg-surface-container-low ring-2 ring-primary-fixed-dim'
                        : 'border-outline-variant hover:bg-surface-container-low',
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => update('role', option.value)}
                      className="sr-only"
                    />
                    <Icon
                      name={option.icon}
                      size={20}
                      className={isSelected ? 'text-primary-container' : 'text-secondary'}
                    />
                    <span className="min-w-0">
                      <span className="block font-label-md text-label-md font-semibold text-primary">
                        {option.label}
                      </span>
                      <span className="block font-label-sm text-label-sm text-secondary">
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.role && (
              <p className="flex items-center gap-1 font-label-sm text-label-sm text-error">
                <Icon name="error" size={14} />
                {errors.role}
              </p>
            )}
          </fieldset>

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            loadingText="Oluşturuluyor..."
            className="bg-primary hover:bg-primary-container"
          >
            Hesap Oluştur
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Zaten bir hesabın var mı?
            <Link
              to="/giris"
              className="ml-1 font-label-md text-label-md text-primary hover:underline"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
