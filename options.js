const SAMPLE = {
  title: "Box Developer Documentation",
  url: "https://developer.box.com/",
  selection: "sample selected text"
};

const _buildPresets = (__settings) => {
  const container = document.querySelector("#presets");
  for (const preset of YakipperSettings.PRESETS) {
    const row = document.createElement("label");
    row.className = "preset";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "preset";
    radio.value = preset.id;
    radio.checked = preset.id === __settings.presetId;

    const label = document.createElement("span");
    label.className = "preset-label";
    label.textContent = preset.label;

    row.appendChild(radio);
    row.appendChild(label);

    if (preset.template !== null) {
      const sample = document.createElement("code");
      sample.className = "preset-template";
      sample.textContent = preset.template.replace(/\n/g, "\\n");
      row.appendChild(sample);
    }
    container.appendChild(row);
  }
}

const _currentSettings = () => {
  const checked = document.querySelector("input[name=preset]:checked");
  return {
    presetId: checked ? checked.value : YakipperSettings.DEFAULTS.presetId,
    customTemplate: document.querySelector("#custom-template").value
  };
}

const _refresh = () => {
  const settings = _currentSettings();
  const isCustom = settings.presetId === YakipperSettings.CUSTOM_PRESET_ID;
  document.querySelector("#custom-template").disabled = !isCustom;

  const template = YakipperSettings.templateFor(settings);
  document.querySelector("#preview-plain").textContent =
    YakipperSettings.renderPayload(template, { title: SAMPLE.title, url: SAMPLE.url }, "text");
  document.querySelector("#preview-selection").textContent =
    YakipperSettings.renderPayload(template, SAMPLE, "text");
}

const _showStatus = (__text) => {
  const status = document.querySelector("#status");
  status.textContent = __text;
  setTimeout(() => { status.textContent = ""; }, 2000);
}

const _apply = (__settings) => {
  const radio = document.querySelector(`input[name=preset][value="${__settings.presetId}"]`);
  if (radio) {
    radio.checked = true;
  }
  document.querySelector("#custom-template").value = __settings.customTemplate;
  _refresh();
}

window.addEventListener("load", async () => {
  const settings = await YakipperSettings.load();
  _buildPresets(settings);
  _apply(settings);

  document.querySelector("#presets").addEventListener("change", _refresh);
  document.querySelector("#custom-template").addEventListener("input", _refresh);

  document.querySelector("#format-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    await YakipperSettings.save(_currentSettings());
    _showStatus("Saved");
  });

  document.querySelector("#reset").addEventListener("click", () => {
    _apply(YakipperSettings.DEFAULTS);
    _showStatus("Reset — press Save to apply");
  });
});
