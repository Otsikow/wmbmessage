export const BRAND_NAME = "MessageGuide";
const DEFAULT_BRAND_URL = "https://messageguide.app";

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
