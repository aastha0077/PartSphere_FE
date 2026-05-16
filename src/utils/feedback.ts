import { isAxiosError } from 'axios';
import type { CSSProperties } from 'react';
import { toast } from 'sonner';

export type ErrorContext =
  | 'login'
  | 'signup'
  | 'load'
  | 'save'
  | 'delete'
  | 'checkout'
  | 'booking'
  | 'generic';

export type FieldErrors = Record<string, string | undefined>;

interface ApiErrorBody {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

const CONTEXT_FALLBACKS: Record<ErrorContext, string> = {
  login: 'Sign-in failed. Please check your email and password.',
  signup: 'We could not create your account. Please review the form and try again.',
  load: 'We could not load this data. Please refresh the page or try again later.',
  save: 'Your changes could not be saved. Please check the form and try again.',
  delete: 'This item could not be removed. It may still be linked to other records.',
  checkout: 'Checkout could not be completed. Please review your cart and try again.',
  booking: 'Your appointment could not be booked. Please try again.',
  generic: 'Something went wrong. Please try again.',
};

/** Maps exact backend messages to clearer copy for users. */
const BACKEND_MESSAGE_MAP: Record<string, string> = {
  'Invalid email or password.': 'The email or password you entered is incorrect.',
  'Email is already registered.': 'This email is already registered. Sign in or use a different email.',
  'Email is already in use.': 'This email is already in use. Try another email address.',
  'Name is required.': 'Please enter your full name.',
  'Email is required.': 'Please enter your email address.',
  'Password must be at least 6 characters.': 'Password must be at least 6 characters long.',
  'Password is required for registration.': 'Please enter a password for this account.',
  'Account is deactivated. Contact administrator.':
    'This account has been deactivated. Contact your administrator for help.',
  'Customer profile not found.': 'We could not find your customer profile. Please contact support.',
  'Customer not found.': 'The selected customer could not be found.',
  'Order must contain at least one item.': 'Add at least one item before placing an order.',
  'You do not have permission to access this resource.':
    'You do not have permission to perform this action.',
  'An unexpected error occurred. Please try again later.':
    'A server error occurred. Please wait a moment and try again.',
};

const STATUS_FALLBACKS: Record<number, string> = {
  400: 'Some information looks invalid. Please review the form and try again.',
  401: 'You are not signed in or your session has expired. Please sign in again.',
  403: 'You do not have permission to do that.',
  404: 'The requested item could not be found. It may have been removed.',
  409: 'This action conflicts with existing data. Please review and try again.',
  422: 'Please fix the highlighted fields and try again.',
  500: 'A server error occurred. Please try again in a few minutes.',
};

function firstValidationMessage(errors?: Record<string, string[]>): string | undefined {
  if (!errors) return undefined;
  for (const messages of Object.values(errors)) {
    if (messages?.length) return messages[0];
  }
  return undefined;
}

function statusFallback(status: number, context: ErrorContext): string {
  if (context === 'login' && status === 401) {
    return 'The email or password you entered is incorrect.';
  }
  if (context === 'signup' && status === 400) {
    return CONTEXT_FALLBACKS.signup;
  }
  return STATUS_FALLBACKS[status] ?? CONTEXT_FALLBACKS[context];
}

export function getApiErrorMessage(
  error: unknown,
  options?: { fallback?: string; context?: ErrorContext }
): string {
  const context = options?.context ?? 'generic';
  const fallback = options?.fallback ?? CONTEXT_FALLBACKS[context];

  if (!error) return fallback;

  if (isAxiosError(error)) {
    if (!error.response) {
      return 'Cannot reach the server. Check your internet connection and that the app is running.';
    }

    const data = error.response.data as ApiErrorBody | string | undefined;
    const validationMsg =
      typeof data === 'object' && data !== null
        ? firstValidationMessage(data.errors)
        : undefined;

    const rawMessage =
      validationMsg ??
      (typeof data === 'string' ? data : data?.message ?? data?.title);

    if (rawMessage) {
      const trimmed = rawMessage.trim();
      return BACKEND_MESSAGE_MAP[trimmed] ?? trimmed;
    }

    return statusFallback(error.response.status, context);
  }

  if (error instanceof Error && error.message) {
    return BACKEND_MESSAGE_MAP[error.message] ?? error.message;
  }

  return fallback;
}

export function toastApiError(
  error: unknown,
  options?: { fallback?: string; context?: ErrorContext }
): string {
  const message = getApiErrorMessage(error, options);
  toast.error(message);
  return message;
}

export function toastValidationError(message: string): void {
  toast.error(message);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Email is required.';
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address (e.g. name@example.com).';
  return undefined;
}

export function validatePassword(password: string, options?: { minLength?: number }): string | undefined {
  const min = options?.minLength ?? 6;
  if (!password) return 'Password is required.';
  if (password.length < min) return `Password must be at least ${min} characters.`;
  return undefined;
}

export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required.`;
  return undefined;
}

export function validateLoginForm(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function validateSignupForm(name: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const nameError = validateRequired(name, 'Full name');
  if (nameError) errors.name = nameError;
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function validateStaffForm(
  data: { name: string; email: string; password: string },
  isEdit: boolean
): FieldErrors {
  const errors: FieldErrors = {};
  const nameError = validateRequired(data.name, 'Name');
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  if (!isEdit) {
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
  } else if (data.password) {
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
  }

  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export const inputErrorStyle: CSSProperties = {
  borderColor: 'rgba(248, 113, 113, 0.6)',
  boxShadow: '0 0 0 1px rgba(248, 113, 113, 0.25)',
};
