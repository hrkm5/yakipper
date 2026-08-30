/*
Unit tests for the template rendering in settings.js.

settings.js is a classic script that assigns a global, so it is evaluated in a
vm context here rather than imported. No package.json, no dependencies:

  node --test "test/*.test.mjs"
*/

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const source = readFileSync(fileURLToPath(new URL("../settings.js", import.meta.url)), "utf8");
const sandbox = vm.createContext({});
vm.runInContext(source, sandbox);
const Settings = sandbox.YakipperSettings;

const TITLE = "Box Developer Documentation";
const URL_ = "https://developer.box.com/";

const templateOf = (presetId) => Settings.templateFor({ presetId, customTemplate: "" });

test("the default preset reproduces the pre-settings output", () => {
  assert.equal(
    Settings.renderPayload(templateOf("default"), { title: TITLE, url: URL_ }, "text"),
    `* ${TITLE}\n${URL_}`
  );
});

test("presets render their documented formats", () => {
  const values = { title: TITLE, url: URL_ };
  assert.equal(Settings.render(templateOf("markdown"), values, "text"), `[${TITLE}](${URL_})`);
  assert.equal(Settings.render(templateOf("url_only"), values, "text"), URL_);
  assert.equal(Settings.render(templateOf("title_only"), values, "text"), TITLE);
  assert.equal(Settings.render(templateOf("title_url_inline"), values, "text"), `${TITLE} - ${URL_}`);
});

test("an unknown preset id falls back to the default template", () => {
  assert.equal(templateOf("nope"), Settings.DEFAULTS.customTemplate);
});

test("the custom preset uses the user template", () => {
  const settings = { presetId: "custom", customTemplate: "<{{url}}>" };
  assert.equal(
    Settings.render(Settings.templateFor(settings), { url: URL_ }, "text"),
    `<${URL_}>`
  );
});

test("html mode escapes title and url and converts newlines", () => {
  const out = Settings.render(templateOf("default"), {
    title: 'A <b>bold</b> & "quoted" title',
    url: "https://example.com/?a=1&b=2"
  }, "html");
  assert.equal(
    out,
    '* A &lt;b&gt;bold&lt;/b&gt; &amp; &quot;quoted&quot; title<br/>https://example.com/?a=1&amp;b=2'
  );
});

test("html mode keeps the selection markup intact", () => {
  const out = Settings.render("{{selection}}", { selection: "<em>kept</em>" }, "html");
  assert.equal(out, "<em>kept</em>");
});

test("html mode escapes literal template segments", () => {
  const out = Settings.render("<{{url}}>", { url: URL_ }, "html");
  assert.equal(out, `&lt;${URL_}&gt;`);
});

test("a value containing a placeholder is not substituted twice", () => {
  const out = Settings.render("{{title}} :: {{url}}", {
    title: "{{url}}",
    url: URL_
  }, "text");
  assert.equal(out, `{{url}} :: ${URL_}`);
});

test("a selection is appended when the template has no {{selection}}", () => {
  assert.equal(
    Settings.renderPayload(templateOf("url_only"), { url: URL_, selection: "picked" }, "text"),
    `${URL_}\npicked`
  );
  assert.equal(
    Settings.renderPayload(templateOf("url_only"), { url: URL_, selection: "<i>picked</i>" }, "html"),
    `${URL_}<br/><i>picked</i>`
  );
});

test("a selection is placed inline and not appended when {{selection}} is present", () => {
  assert.equal(
    Settings.renderPayload("{{selection}} -- {{url}}", { url: URL_, selection: "picked" }, "text"),
    `picked -- ${URL_}`
  );
});

test("nothing is appended when there is no selection", () => {
  assert.equal(
    Settings.renderPayload(templateOf("url_only"), { url: URL_, selection: "" }, "text"),
    URL_
  );
});

test("missing values render as empty strings", () => {
  assert.equal(Settings.render(templateOf("default"), {}, "text"), "* \n");
});

test("render is reentrant across calls (regex lastIndex is reset)", () => {
  const values = { title: TITLE, url: URL_ };
  const first = Settings.render(templateOf("default"), values, "text");
  const second = Settings.render(templateOf("default"), values, "text");
  assert.equal(first, second);
});
