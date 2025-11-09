const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^(?=.{2,100}$)[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/;

const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasLowercase = (value: string) => /[a-z]/.test(value);
const hasNumber = (value: string) => /\d/.test(value);
const hasSymbol = (value: string) => /[^A-Za-z0-9]/.test(value);

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

export function validateSignUpInput({
  name,
  email,
  password,
}: SignUpInput): ValidationResult<SignUpInput> {
  const sanitized = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
  };

  const errors: string[] = [];

  if (!sanitized.name) {
    errors.push("Name is required.");
  } else if (!NAME_REGEX.test(sanitized.name)) {
    errors.push(
      "Name must be 2-100 characters and may include letters, spaces, apostrophes, or hyphens."
    );
  }

  if (!sanitized.email) {
    errors.push("Email is required.");
  } else if (!EMAIL_REGEX.test(sanitized.email)) {
    errors.push("Enter a valid email address.");
  }

  if (!sanitized.password) {
    errors.push("Password is required.");
  } else {
    if (sanitized.password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!hasUppercase(sanitized.password)) {
      errors.push("Password must include an uppercase letter.");
    }
    if (!hasLowercase(sanitized.password)) {
      errors.push("Password must include a lowercase letter.");
    }
    if (!hasNumber(sanitized.password)) {
      errors.push("Password must include a number.");
    }
    if (!hasSymbol(sanitized.password)) {
      errors.push("Password must include a special character.");
    }
  }

  return { sanitized, errors };
}

export function validateSignInInput({
  email,
  password,
}: SignInInput): ValidationResult<SignInInput> {
  const sanitized = {
    email: email.trim().toLowerCase(),
    password: password.trim(),
  };

  const errors: string[] = [];

  if (!sanitized.email) {
    errors.push("Email is required.");
  } else if (!EMAIL_REGEX.test(sanitized.email)) {
    errors.push("Enter a valid email address.");
  }

  if (!sanitized.password) {
    errors.push("Password is required.");
  }

  return { sanitized, errors };
}
