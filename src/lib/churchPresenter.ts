/**
 * Offline Church Presenter download package.
 *
 * Single source of truth for the card shown on the public /downloads page and
 * for the unobtrusive link from the home-page Song Book area.
 */
export const CHURCH_PRESENTER = {
  cardId: "church-presenter",
  title: "Church Presenter",
  type: "ZIP",
  description:
    "The full offline presentation package: songs, the KJV Bible and William Branham messages, ready to run without an internet connection.",
  size: "About 35 MB",
  format: "ZIP archive",
  contents: "Songs, KJV Bible, William Branham messages",
  browsers: "Chrome, Edge or Brave",
  driveUrl:
    "https://drive.google.com/file/d/12NsItXmQksfVy_NRZjRRsPcvkD7gCVIx/view",
  requiresSignIn: false,
  steps: [
    "Download the ZIP file, then unzip it to a folder on your computer.",
    "Open Church Presenter.html in Chrome, Edge or Brave.",
    "Consult Start Here.txt for projector setup.",
  ],
} as const;
