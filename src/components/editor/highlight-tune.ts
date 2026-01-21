"use client";

import type { API, BlockTune } from "@editorjs/editorjs";

export default class HighlightTune implements BlockTune {
  static get name() {
    return "highlight";
  }

  static get isTune() {
    return true;
  }

  private api: API;
  private data: { highlighted?: boolean };
  private button: HTMLButtonElement;

  constructor({ api, data }: { api: API; data?: any }) {
    this.api = api;
    this.data = data ?? {};

    this.button = document.createElement("button");
    this.button.innerHTML = "⚡";
    this.button.className =
      api.styles?.settingsButton ?? "cdx-settings-button";

    this.button.onclick = () => {
      this.data.highlighted = !this.data.highlighted;
      this.render();
    };
  }

  render() {
    const active =
      this.api.styles?.settingsButtonActive ??
      "cdx-settings-button--active";

    this.button.classList.toggle(
      active,
      Boolean(this.data.highlighted)
    );

    return this.button;
  }

  save() {
    return { highlighted: Boolean(this.data.highlighted) };
  }

  wrap(content: HTMLElement) {
    return content;
  }
}
