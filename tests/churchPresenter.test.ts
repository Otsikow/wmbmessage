import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { CHURCH_PRESENTER, CHURCH_PRESENTER_PATH } from "@/lib/churchPresenter";

describe("Church Presenter download package", () => {
  test("links to the exact Drive file the user supplied", () => {
    assert.equal(
      CHURCH_PRESENTER.driveUrl,
      "https://drive.google.com/file/d/12NsItXmQksfVy_NRZjRRsPcvkD7gCVIx/view",
    );
  });

  test("requires no MessageGuide sign-in", () => {
    assert.equal(CHURCH_PRESENTER.requiresSignIn, false);
  });

  test("states the package size and contents", () => {
    assert.equal(CHURCH_PRESENTER.size, "About 35 MB");
    assert.equal(CHURCH_PRESENTER.type, "ZIP");
    assert.match(CHURCH_PRESENTER.contents, /Songs/);
    assert.match(CHURCH_PRESENTER.contents, /KJV Bible/);
    assert.match(CHURCH_PRESENTER.contents, /William Branham messages/);
  });

  test("gives exactly three setup steps covering unzip, browser and projector", () => {
    assert.equal(CHURCH_PRESENTER.steps.length, 3);
    const all = CHURCH_PRESENTER.steps.join(" ");
    assert.match(all, /unzip/i);
    assert.match(all, /Church Presenter\.html/);
    assert.match(all, /Chrome/);
    assert.match(all, /Edge/);
    assert.match(all, /Brave/);
    assert.match(all, /Start Here\.txt/);
    assert.match(all, /projector/i);
    assert.match(all, /Show on audience screen/);
  });

  test("has a stable card id used by the home-page anchor link", () => {
    assert.equal(CHURCH_PRESENTER.cardId, "church-presenter");
    assert.equal(CHURCH_PRESENTER_PATH, "/downloads#church-presenter");
  });
});
