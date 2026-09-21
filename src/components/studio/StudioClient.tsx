"use client";

import { useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { canvasToBlob, downloadBlob } from "@/image-engine/export";
import { aspectForRect } from "@/image-engine/geometry";
import { validatePhotoFile } from "@/image-engine/input";
import { renderTemplateToCanvas } from "@/image-engine/render";
import { getTemplates } from "@/templates/registry";
import type { FormatId, IdentityId, TemplateDefinition } from "@/templates/types";
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

export default function StudioClient() {
  const [identity, setIdentity] = useState<IdentityId>("paulinha");
  const [format, setFormat] = useState<FormatId>("avatar");
  const availableTemplates = useMemo(() => getTemplates(identity, format), [identity, format]);
  const [templateId, setTemplateId] = useState(availableTemplates[0]?.id ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setTemplateId(availableTemplates[0]?.id ?? "");
  }, [availableTemplates]);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  const template: TemplateDefinition | undefined = availableTemplates.find((item) => item.id === templateId) ?? availableTemplates[0];
  const aspect = template ? aspectForRect(template.photoArea, template.width, template.height) : 1;

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
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropPixels(null);
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
              <button key={item.id} type="button" data-active={identity === item.id} onClick={() => setIdentity(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>2. Formato</legend>
          <div className={styles.segmented}>
            {formats.map((item) => (
              <button key={item.id} type="button" data-active={format === item.id} onClick={() => setFormat(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className={styles.label}>
          3. Template
          <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
            {availableTemplates.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
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
        <div className={styles.cropShell} style={{ aspectRatio }}>
          {photoUrl ? (
            <Cropper
              image={photoUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={template?.cropShape === "round" ? "round" : "rect"}
              showGrid={format !== "avatar"}
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
