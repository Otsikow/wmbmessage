export const BRAND_NAME = "MessageGuide";
const DEFAULT_BRAND_URL = "https://messageguide.org";

export const getBrandUrl = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return DEFAULT_BRAND_URL;
};

export const buildShareAttribution = () => `${BRAND_NAME} – ${getBrandUrl()}`;

export const appendShareAttribution = (content: string) => {
  if (!content.trim()) return buildShareAttribution();

  return `${content}\n\nShared via ${buildShareAttribution()}`;
};

export const buildShareUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, DEFAULT_BRAND_URL).toString();
};
