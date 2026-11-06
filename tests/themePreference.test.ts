import { strict as assert } from "node:assert";
import { test } from "node:test";
import { resolveThemePreference } from "../src/lib/themePreference.ts";

test("fresh storage preserves the shared light default even with dark OS", () => {
  assert.equal(resolveThemePreference(undefined, null, true), "light");
});
test("persisted light wins over dark system and conflicting legacy preference", () => {
  assert.equal(resolveThemePreference("light", "dark", true), "light");
});
test("persisted dark wins over light OS and conflicting legacy preference", () => {
  assert.equal(resolveThemePreference("dark", "light", false), "dark");
});
test("legacy explicit preference migrates only without a valid settings theme", () => {
  assert.equal(resolveThemePreference(undefined, "dark", false), "dark");
  assert.equal(resolveThemePreference("invalid", "light", true), "light");
});
test("legacy system preference resolves once for migration", () => {
  assert.equal(resolveThemePreference(undefined, "system", true), "dark");
  assert.equal(resolveThemePreference(undefined, "system", false), "light");
});