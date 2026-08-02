/**
 * İstemci tarafı form doğrulama kuralları.
 * Sunucudaki zod şemalarıyla aynı kuralları uygular; amaç kullanıcıya
 * ağ turu beklemeden anında geri bildirim vermektir.
 */

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function required(value: string, label: string): string | undefined {
  return value.trim().length === 0 ? `${label} zorunludur.` : undefined;
}

export function minLength(value: string, length: number, label: string): string | undefined {
  return value.trim().length < length ? `${label} en az ${length} karakter olmalıdır.` : undefined;
}

/* --------------------------- Form doğrulayıcıları -------------------------- */

export interface LoginEmailForm {
  email: string;
}

export function validateLoginEmail(form: LoginEmailForm): FieldErrors<LoginEmailForm> {
  const errors: FieldErrors<LoginEmailForm> = {};
  if (!form.email.trim()) errors.email = 'E-posta adresi zorunludur.';
  else if (!isValidEmail(form.email)) errors.email = 'Geçerli bir e-posta adresi girin.';
  return errors;
}

export interface RegisterForm {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
  role: string;
}

export function validateRegister(form: RegisterForm): FieldErrors<RegisterForm> {
  const errors: FieldErrors<RegisterForm> = {};

  const fullName = required(form.fullName, 'Ad Soyad') ?? minLength(form.fullName, 3, 'Ad Soyad');
  if (fullName) errors.fullName = fullName;

  const company = required(form.companyName, 'Şirket adı');
  if (company) errors.companyName = company;

  if (!form.email.trim()) errors.email = 'E-posta adresi zorunludur.';
  else if (!isValidEmail(form.email)) errors.email = 'Geçerli bir e-posta adresi girin.';

  const password = required(form.password, 'Şifre') ?? minLength(form.password, 8, 'Şifre');
  if (password) errors.password = password;

  if (!form.role) errors.role = 'Bir hesap türü seçin.';

  return errors;
}

export interface EventForm {
  eventName: string;
  eventDate: string;
  eventCategory: string;
  participantCount: string;
  eventDescription: string;
  sponsorPackages: string[];
}

export function validateEvent(form: EventForm): FieldErrors<EventForm> {
  const errors: FieldErrors<EventForm> = {};

  const name =
    required(form.eventName, 'Etkinlik adı') ?? minLength(form.eventName, 3, 'Etkinlik adı');
  if (name) errors.eventName = name;

  const date = required(form.eventDate, 'Etkinlik tarihi');
  if (date) errors.eventDate = date;

  if (!form.eventCategory) errors.eventCategory = 'Bir kategori seçin.';
  if (!form.participantCount) errors.participantCount = 'Katılımcı aralığı seçin.';

  const description =
    required(form.eventDescription, 'Etkinlik detayı') ??
    minLength(form.eventDescription, 20, 'Etkinlik detayı');
  if (description) errors.eventDescription = description;

  if (form.sponsorPackages.length === 0) {
    errors.sponsorPackages = 'En az bir sponsorluk paketi seçin.';
  }

  return errors;
}

export interface SupportForm {
  fullName: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export function validateSupport(form: SupportForm): FieldErrors<SupportForm> {
  const errors: FieldErrors<SupportForm> = {};

  const name = required(form.fullName, 'Ad Soyad');
  if (name) errors.fullName = name;

  if (!form.email.trim()) errors.email = 'E-posta adresi zorunludur.';
  else if (!isValidEmail(form.email)) errors.email = 'Geçerli bir e-posta adresi girin.';

  const subject = required(form.subject, 'Konu');
  if (subject) errors.subject = subject;

  if (!form.category) errors.category = 'Bir kategori seçin.';

  const message = required(form.message, 'Mesaj') ?? minLength(form.message, 20, 'Mesaj');
  if (message) errors.message = message;

  return errors;
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function validatePassword(form: PasswordForm): FieldErrors<PasswordForm> {
  const errors: FieldErrors<PasswordForm> = {};

  const current = required(form.currentPassword, 'Mevcut şifre');
  if (current) errors.currentPassword = current;

  const next =
    required(form.newPassword, 'Yeni şifre') ?? minLength(form.newPassword, 8, 'Yeni şifre');
  if (next) errors.newPassword = next;

  if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Şifreler eşleşmiyor.';
  }

  return errors;
}

/** Hata nesnesinin boş olup olmadığını kontrol eder. */
export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}
