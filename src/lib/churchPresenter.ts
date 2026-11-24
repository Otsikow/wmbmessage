const browsers = "Chrome, Edge or Brave";

export const CHURCH_PRESENTER = {
  cardId: "church-presenter",
  title: "Church Presenter",
  type: "ZIP",
  description:
    "Put lyrics, Scripture and message excerpts on screen during church services. After downloading, you can use the presenter offline.",
  size: "About 35 MB",
  format: "ZIP archive",
  contents: "Songs, KJV Bible, William Branham messages",
  browsers,
  driveUrl:
    "https://drive.google.com/file/d/12NsItXmQksfVy_NRZjRRsPcvkD7gCVIx/view",
  requiresSignIn: false,
  steps: [
    "Download the ZIP file from Google Drive and unzip it on your computer.",
    `Open Church Presenter.html from the extracted folder in ${browsers}.`,
    "Connect your projector or second screen, set it to extend your desktop, then choose Show on audience screen in the presenter. See Start Here.txt for the full setup.",
  ],
} as const;

export const CHURCH_PRESENTER_PATH = `/downloads#${CHURCH_PRESENTER.cardId}`;
