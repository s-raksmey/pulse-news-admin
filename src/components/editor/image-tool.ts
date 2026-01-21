import type { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

type ImageData = {
  url?: string;
  caption?: string;
};

export default class ImageTool implements BlockTool {
  private data: ImageData;
  private wrapper: HTMLElement;
  private loading = false;

  constructor({ data }: BlockToolConstructorOptions<ImageData>) {
    this.data = data || {};
    this.wrapper = document.createElement("div");
  }

  static get toolbox() {
    return {
      title: "Image",
      icon: "🖼️",
    };
  }

  render() {
    this.wrapper.innerHTML = "";

    if (this.loading) {
      this.wrapper.innerHTML =
        `<div class="text-sm text-slate-500">Uploading image…</div>`;
      return this.wrapper;
    }

    if (this.data.url) {
      const img = document.createElement("img");
      img.src = this.data.url;
      img.className = "w-full rounded-lg border";
      this.wrapper.appendChild(img);
      return this.wrapper;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.className = "block w-full text-sm";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const form = new FormData();
      form.append("file", file);

      this.loading = true;
      this.render();

      try {
        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: form,
        });

        const json = await res.json();

        if (!json.success || !json.file?.url) {
          this.loading = false;
          this.wrapper.innerHTML = `
            <div class="text-sm text-red-600">
              ${json.message || "Upload failed"}
            </div>
          `;
          return;
        }

        this.data.url = json.file.url;
        this.loading = false;
        this.render();
      } catch {
        this.loading = false;
        this.wrapper.innerHTML = `
          <div class="text-sm text-red-600">
            Upload error. Please try again.
          </div>
        `;
      }
    };

    this.wrapper.appendChild(input);
    return this.wrapper;
  }

  save() {
    return this.data;
  }
}
