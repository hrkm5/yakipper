/*
YakipperSettings

Stores and renders the clipboard copy format.

Loaded as a classic script both by the content scripts (see manifest.json) and
by the options page, so it follows the same IIFE-singleton shape as
popup-message.js and exposes a single global.

The clipboard write in content.js must stay inside the user gesture chain, so
settings are never awaited inline: the cache is filled on load and refreshed
through chrome.storage.onChanged, and get() always answers synchronously.
*/

var YakipperSettings = (function () {
  const STORAGE_KEY = "clipboardFormat";

  const CUSTOM_PRESET_ID = "custom";

  const PRESETS = [
    { id: "default", label: "Title & URL (default)", template: "* {{title}}\n{{url}}" },
    { id: "markdown", label: "Markdown link", template: "[{{title}}]({{url}})" },
    { id: "url_only", label: "URL only", template: "{{url}}" },
    { id: "title_only", label: "Title only", template: "{{title}}" },
    { id: "title_url_inline", label: "Title - URL", template: "{{title}} - {{url}}" },
    { id: CUSTOM_PRESET_ID, label: "Custom", template: null }
  ];

  const DEFAULTS = {
    presetId: "default",
    customTemplate: "* {{title}}\n{{url}}"
  };

  const PLACEHOLDER = /\{\{(title|url|selection)\}\}/g;

  let _cache = Object.assign({}, DEFAULTS);

  function _normalize(__stored) {
    const settings = Object.assign({}, DEFAULTS, __stored || {});
    const known = PRESETS.some((preset) => preset.id === settings.presetId);
    if (!known) {
      settings.presetId = DEFAULTS.presetId;
    }
    if (typeof settings.customTemplate !== "string") {
      settings.customTemplate = DEFAULTS.customTemplate;
    }
    return settings;
  }

  function _escapeHtml(__str) {
    return __str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function get() {
    return Object.assign({}, _cache);
  }

  function load() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(STORAGE_KEY, (stored) => {
        _cache = _normalize(stored && stored[STORAGE_KEY]);
        resolve(get());
      });
    });
  }

  function save(__settings) {
    const settings = _normalize(__settings);
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: settings }, () => {
        _cache = settings;
        resolve(get());
      });
    });
  }

  function templateFor(__settings) {
    const settings = _normalize(__settings);
    if (settings.presetId === CUSTOM_PRESET_ID) {
      return settings.customTemplate;
    }
    const preset = PRESETS.find((candidate) => candidate.id === settings.presetId);
    return preset && preset.template !== null ? preset.template : DEFAULTS.customTemplate;
  }

  function activeTemplate() {
    return templateFor(_cache);
  }

  function hasSelectionPlaceholder(__template) {
    return __template.indexOf("{{selection}}") !== -1;
  }

  /*
  Renders __template with __values.

  The template is tokenized rather than run through a chain of String.replace
  calls, so a value that itself contains something like "{{url}}" is never
  substituted a second time.

  __mode "html" escapes the literal segments plus title/url and turns newlines
  into <br/>; selection is inserted as-is because it carries the markup of the
  user's selection. __mode "text" inserts everything verbatim.
  */
  function render(__template, __values, __mode) {
    const isHtml = __mode === "html";
    const values = __values || {};
    let out = "";
    let cursor = 0;
    let match;

    PLACEHOLDER.lastIndex = 0;
    while ((match = PLACEHOLDER.exec(__template)) !== null) {
      out += _renderLiteral(__template.slice(cursor, match.index), isHtml);
      out += _renderValue(match[1], values[match[1]], isHtml);
      cursor = match.index + match[0].length;
    }
    out += _renderLiteral(__template.slice(cursor), isHtml);

    return out;
  }

  function _renderLiteral(__literal, __isHtml) {
    if (!__isHtml) {
      return __literal;
    }
    return _escapeHtml(__literal).replace(/\n/g, "<br/>");
  }

  function _renderValue(__name, __value, __isHtml) {
    const value = typeof __value === "string" ? __value : "";
    if (!__isHtml) {
      return value;
    }
    // The selection keeps its own markup; title and url are plain text.
    return __name === "selection" ? value : _escapeHtml(value);
  }

  /*
  Renders a full clipboard payload. When there is a selection but the template
  has no {{selection}} placeholder, the selection is appended, which keeps the
  long-standing "URL, then the selected text below it" output.
  */
  function renderPayload(__template, __values, __mode) {
    const values = __values || {};
    const selection = typeof values.selection === "string" ? values.selection : "";
    let out = render(__template, values, __mode);

    if (selection !== "" && !hasSelectionPlaceholder(__template)) {
      out += __mode === "html" ? "<br/>" + selection : "\n" + selection;
    }
    return out;
  }

  function subscribe(__callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync" || !changes[STORAGE_KEY]) {
        return;
      }
      _cache = _normalize(changes[STORAGE_KEY].newValue);
      if (__callback) {
        __callback(get());
      }
    });
  }

  return {
    STORAGE_KEY,
    CUSTOM_PRESET_ID,
    PRESETS,
    DEFAULTS,
    get,
    load,
    save,
    templateFor,
    activeTemplate,
    escapeHtml: _escapeHtml,
    render,
    renderPayload,
    subscribe
  };
})();

// Fill the cache and keep it fresh. Guarded so the module can also be loaded
// outside an extension context (unit tests).
if (typeof chrome !== "undefined" && chrome.storage) {
  YakipperSettings.load();
  YakipperSettings.subscribe();
}
