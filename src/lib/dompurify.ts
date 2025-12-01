// Lightweight DOMPurify-compatible sanitizer for offline usage
// This provides a minimal sanitize implementation to strip dangerous HTML.

const BLOCKED_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
];

const UNSAFE_ATTRIBUTES = new Set(["srcdoc"]);

const isSafeUrl = (value: string) => {
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:", "mailto:", "tel:", ""].includes(url.protocol);
  } catch (error) {
    // If URL construction fails, treat it as unsafe
    return false;
  }
};

const sanitize = (dirty: string) => {
  if (!dirty) return "";

  const parser = new DOMParser();
  const documentFragment = parser.parseFromString(`<template>${dirty}</template>`, "text/html");
  const template = documentFragment.querySelector("template");

  if (!template) return "";

  // Remove blocked elements entirely
  template.content
    .querySelectorAll(BLOCKED_TAGS.join(","))
    .forEach((node) => node.remove());

  // Scrub attributes that can lead to script execution or injection
  template.content.querySelectorAll<HTMLElement>("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();
      const attributeValue = attribute.value;

      if (attributeName.startsWith("on") || UNSAFE_ATTRIBUTES.has(attributeName)) {
        element.removeAttribute(attribute.name);
        return;
      }

      if ((attributeName === "src" || attributeName === "href") && !isSafeUrl(attributeValue)) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (attributeName === "style") {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return template.innerHTML;
};

const DOMPurify = {
  sanitize,
};

export default DOMPurify;
