"use client";

import { useRef, useState } from "react";

const MAX_EDGE = 1920;
const QUALITY = 0.82;

// Downscales in the browser so phone photos (often 5–10MB) upload quickly and fit the Server Action limit
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", QUALITY));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

export function ImageField({ name, currentUrl, label }: { name: string; currentUrl: string | null; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [remove, setRemove] = useState(false);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const small = await shrink(file);
      // Swap the picked file for the downscaled one so the form submits the small version
      const dt = new DataTransfer();
      dt.items.add(small);
      e.target.files = dt.files;
      setPreview(URL.createObjectURL(small));
      setRemove(false);
      setInfo(`${(small.size / 1024).toFixed(0)} KB`);
    } catch {
      setInfo("Зургийг уншиж чадсангүй. JPG, PNG эсвэл WebP файл сонгоно уу.");
      e.target.value = "";
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field a-image">
      <span className="label">{label}</span>
      <div className="a-image-box">
        {preview && !remove ? (
          // eslint-disable-next-line @next/next/no-img-element -- local preview / own /img route
          <img src={preview} alt="" />
        ) : (
          <span className="a-image-empty">Зураг байхгүй — дүрслэл харагдана</span>
        )}
      </div>
      <div className="a-image-actions">
        <label className="a-btn">
          {busy ? "Боловсруулж байна…" : preview && !remove ? "Зураг солих" : "Зураг сонгох"}
          <input ref={input} type="file" name={name} accept="image/jpeg,image/png,image/webp" onChange={onPick} hidden />
        </label>
        {preview && !remove && (
          <button
            type="button"
            className="a-btn danger"
            onClick={() => {
              setRemove(true);
              if (input.current) input.current.value = "";
              setInfo(null);
            }}
          >
            Зураг хасах
          </button>
        )}
        {info && <span className="a-hint">{info}</span>}
      </div>
      {remove && <input type="hidden" name={`${name}Remove`} value="1" />}
      <p className="a-hint">Хөндлөн (landscape) зураг хамгийн сайн харагдана. Хэт том зургийг автоматаар 1920px болгож багасгана.</p>
    </div>
  );
}
