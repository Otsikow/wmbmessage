export const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export const normalizePhoneNumber = (value: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  const normalized = trimmed.replace(/[\s().-]/g, "");
  return normalized;
};

export const isValidE164 = (value: string) => {
  if (!value) return false;
  return E164_REGEX.test(value);
};

export const formatWhatsAppLink = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
};
