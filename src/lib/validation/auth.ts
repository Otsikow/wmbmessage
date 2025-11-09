import { z } from "zod";

const NAME_REGEX = /^(?=.{2,100}$)[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/;

const sanitizeEmail = (value: string) => value.trim().toLowerCase();
const sanitizeText = (value: string) => value.trim();

const createStrongPasswordIssues = (value: string) => {
  const issues: string[] = [];

  if (value.length < 8) {
    issues.push("Password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(value)) {
    issues.push("Password must include an uppercase letter.");
  }
  if (!/[a-z]/.test(value)) {
    issues.push("Password must include a lowercase letter.");
  }
  if (!/\d/.test(value)) {
    issues.push("Password must include a number.");
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    issues.push("Password must include a special character.");
  }

  return issues;
};

export interface ValidationResult<T> {
  sanitized: T;
  errors: string[];
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  password: string;
  confirmPassword: string;
}

const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name is required." })
  .refine((value) => NAME_REGEX.test(value), {
    message:
      "Name must be 2-100 characters and may include letters, spaces, apostrophes, or hyphens.",
  });

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required." })
  .email({ message: "Enter a valid email address." })
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .trim()
  .min(1, { message: "Password is required." });

const strongPasswordSchema = passwordSchema.superRefine((value, ctx) => {
  for (const issue of createStrongPasswordIssues(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: issue,
    });
  }
});

const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: strongPasswordSchema,
});

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: "Confirm password is required." }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

const sanitizeSignUpInput = ({ name, email, password }: SignUpInput): SignUpInput => ({
  name: sanitizeText(name),
  email: sanitizeEmail(email),
  password: sanitizeText(password),
});

const sanitizeSignInInput = ({ email, password }: SignInInput): SignInInput => ({
  email: sanitizeEmail(email),
  password: sanitizeText(password),
});

const sanitizeResetPasswordInput = ({
  password,
  confirmPassword,
}: ResetPasswordInput): ResetPasswordInput => ({
  password: sanitizeText(password),
  confirmPassword: sanitizeText(confirmPassword),
});

const extractErrors = (error: z.ZodError): string[] =>
  error.errors.map((issue) => issue.message);

export function validateSignUpInput(input: SignUpInput): ValidationResult<SignUpInput> {
  const sanitized = sanitizeSignUpInput(input);
  const result = signUpSchema.safeParse(sanitized);

  if (result.success) {
    return { sanitized: result.data as SignUpInput, errors: [] };
  }

  return {
    sanitized,
    errors: extractErrors(result.error),
  };
}

export function validateSignInInput(input: SignInInput): ValidationResult<SignInInput> {
  const sanitized = sanitizeSignInInput(input);
  const result = signInSchema.safeParse(sanitized);

  if (result.success) {
    return { sanitized: result.data as SignInInput, errors: [] };
  }

  return {
    sanitized,
    errors: extractErrors(result.error),
  };
}

export function validateResetPasswordInput(
  input: ResetPasswordInput
): ValidationResult<ResetPasswordInput> {
  const sanitized = sanitizeResetPasswordInput(input);
  const result = resetPasswordSchema.safeParse(sanitized);

  if (result.success) {
    return { sanitized: result.data as ResetPasswordInput, errors: [] };
  }

  return {
    sanitized,
    errors: extractErrors(result.error),
  };
}
