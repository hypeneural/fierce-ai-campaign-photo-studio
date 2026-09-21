"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import { canvasToBlob, downloadBlob } from "@/image-engine/export";
import { aspectForRect } from "@/image-engine/geometry";
import { validatePhotoFile } from "@/image-engine/input";
import { renderTemplateToCanvas } from "@/image-engine/render";
import { getTemplates } from "@/templates/registry";
import type { FormatId, IdentityId } from "@/templates/types";
import { identityThemes, themeCssVars } from "@/themes/identityThemes";
import styles from "./studio.module.css";

const identities: Array<{ id: IdentityId; label: string; number: string }> = [
  { id: "paulinha", label: "Paulinha", number: "2020" },
  { id: "emerson-stein", label: "Emerson Stein", number: "15100" },
  { id: "paulinha-emerson", label: "Paulinha + Emerson", number: "2020 · 15100" },
];

const formats: Array<{ id: FormatId; label: string; ratio: string }> = [
  { id: "avatar", label: "Avatar 1:1", ratio: "1080×1080" },
  { id: "story", label: "Story 9:16", ratio: "1080×1920" },
];

type StudioSelection = {
  identity: IdentityId;
  format: FormatId;
  templateId: string;
};

const INITIAL_SELECTION: StudioSelection = {
  identity: "paulinha",
  format: "avatar",
  templateId: "paulinha-avatar-official-v1",
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

  const activeTheme = identityThemes[selection.identity] ?? identityThemes.paulinha;

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
    <main
      className={styles.page}
      data-identity={selection.identity}
      style={themeCssVars(activeTheme) as React.CSSProperties}
    >
      <section className={styles.panel}>
        <div className={styles.heroHeader}>
          {activeTheme.hero.portraitSrc && (
            <Image
              src={activeTheme.hero.portraitSrc}
              alt={activeTheme.name}
              width={64}
              height={64}
              className={styles.heroPortrait}
            />
          )}
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>{activeTheme.badge}</span>
            <h1 className={styles.heroTitle}>{activeTheme.hero.title}</h1>
            <p className={styles.heroSubtitle}>{activeTheme.hero.subtitle}</p>
          </div>
        </div>

        <fieldset className={styles.fieldset}>
          <legend>1. Escolha a Identidade</legend>
          <div className={styles.segmented}>
            {identities.map((item) => (
              <button
                key={item.id}
                type="button"
                data-active={selection.identity === item.id}
                onClick={() => handleIdentityChange(item.id)}
              >
                <span>{item.label}</span>
                <span className={styles.muted}>{item.number}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>2. Formato da Mídia</legend>
          <div className={`${styles.segmented} ${styles.segmentedTwo}`}>
            {formats.map((item) => (
              <button
                key={item.id}
                type="button"
                data-active={selection.format === item.id}
                onClick={() => handleFormatChange(item.id)}
              >
                <span>{item.label}</span>
                <span className={styles.muted}>{item.ratio}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>3. Escolha a Moldura</legend>
          <div className={styles.templateGrid} role="radiogroup" aria-label="Selecione a moldura">
            {availableTemplates.map((item) => {
              const isSelected = (template?.id ?? availableTemplates[0]?.id) === item.id;
              const isOfficial = item.status === "official-source" || item.status === "human-supplied";
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-active={isSelected}
                  className={styles.templateCard}
                  onClick={() => handleTemplateChange(item.id)}
                >
                  <div className={styles.cardThumb}>
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.label}
                        width={120}
                        height={120}
                        loading="lazy"
                      />
                    ) : (
                      <span>{item.format}</span>
                    )}
                  </div>
                  <div className={styles.cardDetails}>
                    <span className={styles.cardLabel} title={item.label}>
                      {item.label}
                    </span>
                    <div className={styles.cardFooter}>
                      <span>{item.width}×{item.height}</span>
                      <span className={`${styles.statusBadge} ${isOfficial ? styles.statusOfficial : ""}`}>
                        {isOfficial ? "Oficial" : "Derivado"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className={styles.upload}>
          <span>4. Enviar Foto do Apoiador</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onFile(event.target.files?.[0])}
          />
        </label>

        {photoUrl && (
          <div className={styles.zoomContainer}>
            <label className={styles.label}>
              <span>Zoom do enquadramento</span>
              <span>{Math.round(zoom * 100)}%</span>
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </div>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button
          className={styles.primary}
          type="button"
          disabled={!photoUrl || !cropPixels || exporting}
          onClick={exportCurrent}
        >
          {exporting ? "Gerando imagem em alta resolução…" : `Exportar ${template?.width ?? ""}×${template?.height ?? ""} px`}
        </button>
      </section>

      <section className={styles.previewPanel}>
        <div className={styles.previewHeader}>
          <strong>Prévia de Enquadramento</strong>
          <span className={styles.formatBadge}>
            {template?.width}×{template?.height} px · {template?.cropShape === "round" ? "Circular" : "Retangular"}
          </span>
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
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📷</span>
              <strong>Selecione uma foto para enquadrar</strong>
              <p className={styles.muted}>
                Sua foto é processada exclusivamente no seu navegador (local-first) com segurança e privacidade total.
              </p>
            </div>
          )}
        </div>

        <p className={styles.muted}>
          O enquadramento acima ajusta sua foto com precisão milimétrica. A exportação final é renderizada em alta definição na resolução real do template ({template?.width}×{template?.height} px).
        </p>
      </section>
    </main>
  );
}
