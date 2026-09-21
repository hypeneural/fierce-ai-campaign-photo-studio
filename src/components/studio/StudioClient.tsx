"use client";

import { useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { canvasToBlob, downloadBlob } from "@/image-engine/export";
import { aspectForRect } from "@/image-engine/geometry";
import { validatePhotoFile } from "@/image-engine/input";
import { renderTemplateToCanvas } from "@/image-engine/render";
import { getTemplates } from "@/templates/registry";
import type { FormatId, IdentityId } from "@/templates/types";
import styles from "./studio.module.css";

const identities: Array<{ id: IdentityId; label: string }> = [
  { id: "paulinha", label: "Paulinha" },
  { id: "emerson-stein", label: "Emerson Stein" },
  { id: "paulinha-emerson", label: "Paulinha + Emerson" },
];

const formats: Array<{ id: FormatId; label: string }> = [
  { id: "avatar", label: "Avatar 1:1" },
  { id: "story", label: "Story 9:16" },
];

type StudioSelection = {
  identity: IdentityId;
  format: FormatId;
  templateId: string;
};

const INITIAL_SELECTION: StudioSelection = {
  identity: "paulinha",
  format: "avatar",
  templateId: "paulinha-avatar-placeholder-v1",
};

export default function StudioClient() {
  const [selection, setSelection] = useState<StudioSelection>(INITIAL_SELECTION);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  const availableTemplates = useMemo(
    () => getTemplates(selection.identity, selection.format),
    [selection.identity, selection.format],
  );

  const template = useMemo(
    () => availableTemplates.find((item) => item.id === selection.templateId) ?? availableTemplates[0],
    [availableTemplates, selection.templateId],
  );

  const aspect = template ? aspectForRect(template.photoArea, template.width, template.height) : 1;

  function resetCropState() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropPixels(null);
  }

  function handleIdentityChange(newIdentity: IdentityId) {
    const nextTemplates = getTemplates(newIdentity, selection.format);
    setSelection({
      identity: newIdentity,
      format: selection.format,
      templateId: nextTemplates[0]?.id ?? "",
    });
    resetCropState();
  }

  function handleFormatChange(newFormat: FormatId) {
    const nextTemplates = getTemplates(selection.identity, newFormat);
    setSelection({
      identity: selection.identity,
      format: newFormat,
      templateId: nextTemplates[0]?.id ?? "",
    });
    resetCropState();
  }

  function handleTemplateChange(newTemplateId: string) {
    setSelection((prev) => ({ ...prev, templateId: newTemplateId }));
    resetCropState();
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const validationError = validatePhotoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setPhotoUrl((oldUrl) => {
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      return URL.createObjectURL(file);
    });
    resetCropState();
  }

  async function exportCurrent() {
    if (!photoUrl || !template || !cropPixels) return;
    setExporting(true);
    setError(null);
    try {
      const canvas = await renderTemplateToCanvas({ template, photoSrc: photoUrl, cropPixels });
      const blob = await canvasToBlob(canvas, template);
      downloadBlob(blob, `${template.id}.${template.export.mime === "image/png" ? "png" : "jpg"}`);
    } catch (exportError) {
      console.error(exportError);
      setError("Não foi possível gerar a imagem.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div>
          <p className={styles.eyebrow}>MVP técnico</p>
          <h1>Campaign Photo Studio</h1>
          <p className={styles.muted}>Foto processada localmente no navegador. As artes abaixo são placeholders técnicos.</p>
        </div>

        <fieldset className={styles.fieldset}>
          <legend>1. Identidade</legend>
          <div className={styles.segmented}>
            {identities.map((item) => (
              <button
                key={item.id}
                type="button"
                data-active={selection.identity === item.id}
                onClick={() => handleIdentityChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>2. Formato</legend>
          <div className={styles.segmented}>
            {formats.map((item) => (
              <button
                key={item.id}
                type="button"
                data-active={selection.format === item.id}
                onClick={() => handleFormatChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className={styles.label}>
          3. Template
          <select value={selection.templateId} onChange={(event) => handleTemplateChange(event.target.value)}>
            {availableTemplates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.upload}>
          4. Escolher foto
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onFile(event.target.files?.[0])} />
        </label>

        {photoUrl && (
          <label className={styles.label}>
            Zoom
            <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
          </label>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button className={styles.primary} type="button" disabled={!photoUrl || !cropPixels || exporting} onClick={exportCurrent}>
          {exporting ? "Gerando…" : `Exportar ${template?.width ?? ""}×${template?.height ?? ""}`}
        </button>
      </section>

      <section className={styles.previewPanel}>
        <div className={styles.previewHeader}>
          <strong>Prévia de enquadramento</strong>
          <span>{template?.width}×{template?.height}</span>
        </div>
        <div className={styles.cropShell} style={{ aspectRatio: aspect }}>
          {photoUrl ? (
            <Cropper
              key={template?.id}
              image={photoUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={template?.cropShape === "round" ? "round" : "rect"}
              showGrid={selection.format !== "avatar"}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCropPixels(pixels)}
            />
          ) : (
            <div className={styles.empty}>Selecione uma foto para começar.</div>
          )}
        </div>
        <p className={styles.muted}>O cropper é apenas a interface de enquadramento. A exportação é feita em outro Canvas, na resolução real do template.</p>
      </section>
    </main>
  );
}
