// DOMPurify-compatible sanitizer for offline usage.
// This mimics the DOMPurify API surface we rely on while aggressively stripping
// dangerous markup to avoid XSS when rendering stored note content.

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
  "template",
  "svg",
  "math",
];

const UNSAFE_ATTRIBUTES = new Set([
  "srcdoc",
  "xlink:href",
  "xml:base",
  "xmlns",
]);

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:", "data:", ""]);

const isSafeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return true;

  // Block javascript: or other executable protocol attempts outright
  if (/^(javascript|vbscript|data:text\/html)/i.test(trimmed)) {
    return false;
  }

  try {
    const url = new URL(trimmed, window.location.origin);
    return SAFE_URL_PROTOCOLS.has(url.protocol);
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

  // Remove HTML comments which can hide malicious payloads
  template.content
    .querySelectorAll('*')
    .forEach((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT);
      const commentsToRemove: Comment[] = [];
      while (walker.nextNode()) {
        const current = walker.currentNode as Comment;
        commentsToRemove.push(current);
      }
      commentsToRemove.forEach((comment) => comment.remove());
    });

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
