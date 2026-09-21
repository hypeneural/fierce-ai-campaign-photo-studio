"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import { canvasToBlob, downloadBlob } from "@/image-engine/export";
import { aspectForRect } from "@/image-engine/geometry";
import { normalizePhotoFile, validatePhotoFile } from "@/image-engine/input";
import { renderTemplateToCanvas } from "@/image-engine/render";
import { getTemplates } from "@/templates/registry";
import type { FormatId, IdentityId } from "@/templates/types";
import { identityThemes, themeCssVars } from "@/themes/identityThemes";
import styles from "./studio.module.css";

const identities: Array<{ id: IdentityId; label: string; number: string; role: string }> = [
  { id: "paulinha", label: "Paulinha", number: "2020", role: "Deputada Federal" },
  { id: "emerson-stein", label: "Emerson Stein", number: "15100", role: "Deputado Estadual" },
  { id: "paulinha-emerson", label: "Os Dois", number: "2020 + 15100", role: "Mobilização Conjunta" },
];

const formats: Array<{ id: FormatId; label: string; ratio: string; desc: string }> = [
  { id: "avatar", label: "Avatar 1:1", ratio: "1080×1080", desc: "WhatsApp e Feed" },
  { id: "story", label: "Story 9:16", ratio: "1080×1920", desc: "Instagram e Status" },
];

type StudioSelection = {
  identity: IdentityId;
  format: FormatId;
  templateId: string;
};

const INITIAL_SELECTION: StudioSelection = {
  identity: "paulinha-emerson", // Start on the rich joint experience
  format: "avatar",
  templateId: "duo-avatar-01",
};

export default function StudioClient() {
  const [selection, setSelection] = useState<StudioSelection>(INITIAL_SELECTION);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  const activeTheme = identityThemes[selection.identity] ?? identityThemes["paulinha-emerson"];

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
    // Retain crop/zoom when switching candidate identity if format is identical
  }

  function handleFormatChange(newFormat: FormatId) {
    const nextTemplates = getTemplates(selection.identity, newFormat);
    setSelection({
      identity: selection.identity,
      format: newFormat,
      templateId: nextTemplates[0]?.id ?? "",
    });
    // Format aspect ratio changes (1:1 to 9:16), so recalibrate crop
    resetCropState();
  }

  function handleTemplateChange(newTemplateId: string) {
    // Preserve current crop, zoom and focal position when flipping through molduras!
    setSelection((prev) => ({ ...prev, templateId: newTemplateId }));
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const validationError = validatePhotoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setProcessingPhoto(true);

    try {
      const normalizedBlob = await normalizePhotoFile(file);
      const newUrl = URL.createObjectURL(normalizedBlob);

      setPhotoUrl((oldUrl) => {
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        return newUrl;
      });
      resetCropState();
    } catch {
      setError("Não foi possível carregar a foto selecionada.");
    } finally {
      setProcessingPhoto(false);
    }
  }

  async function exportCurrent() {
    if (!photoUrl || !template || !cropPixels) return;
    setExporting(true);
    setError(null);
    try {
      const canvas = await renderTemplateToCanvas({ template, photoSrc: photoUrl, cropPixels });
      const blob = await canvasToBlob(canvas, template);
      downloadBlob(blob, `apoio-${template.id}.${template.export.mime === "image/png" ? "png" : "jpg"}`);
    } catch (exportError) {
      console.error(exportError);
      setError("Não foi possível gerar a imagem em alta resolução.");
    } finally {
      setExporting(false);
    }
  }

  const overlayLayer = template?.layers.find((l) => l.type === "overlay");

  return (
    <main
      className={styles.page}
      data-identity={selection.identity}
      style={themeCssVars(activeTheme) as React.CSSProperties}
    >
      <header className={styles.appHeader}>
        <div className={styles.headerContent}>
          <div className={styles.heroBadge}>{activeTheme.badge}</div>
          <h1 className={styles.heroTitle}>Crie sua Foto de Apoio</h1>
          <p className={styles.heroSubtitle}>
            Personalize sua imagem com as molduras oficiais da campanha em segundos.
          </p>
        </div>

        <nav className={styles.identitySelector} aria-label="Selecione o candidato">
          {identities.map((item) => {
            const isSelected = selection.identity === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-active={isSelected}
                className={styles.identityCard}
                onClick={() => handleIdentityChange(item.id)}
              >
                <div className={styles.identityMeta}>
                  <strong className={styles.identityName}>{item.label}</strong>
                  <span className={styles.identityNumber}>{item.number}</span>
                </div>
                <span className={styles.identityRole}>{item.role}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <div className={styles.studioLayout}>
        {/* Left Column: Formats, Template Gallery, Controls */}
        <section className={styles.controlsPanel}>
          {/* Format selection */}
          <div className={styles.controlGroup}>
            <label className={styles.groupTitle}>1. Formato da Foto</label>
            <div className={styles.formatSegmented}>
              {formats.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-active={selection.format === item.id}
                  className={styles.formatButton}
                  onClick={() => handleFormatChange(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span className={styles.mutedText}>{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Template Gallery */}
          <div className={styles.controlGroup}>
            <div className={styles.galleryHeader}>
              <label className={styles.groupTitle}>2. Escolha sua Moldura</label>
              <span className={styles.templateCount}>
                {availableTemplates.length} {availableTemplates.length === 1 ? "opção" : "opções"}
              </span>
            </div>

            <div className={styles.templateGallery} role="radiogroup" aria-label="Escolha a moldura">
              {availableTemplates.map((item, index) => {
                const isSelected = (template?.id ?? availableTemplates[0]?.id) === item.id;
                const shortLabel = item.label.includes("·")
                  ? item.label.split("·")[1]?.trim()
                  : item.label;

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
                    <div className={styles.cardThumbnailWrapper}>
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.label}
                          width={140}
                          height={140}
                          className={styles.cardThumbnail}
                          loading="lazy"
                        />
                      ) : (
                        <span className={styles.cardFallback}>{index + 1}</span>
                      )}
                      {isSelected && <div className={styles.selectedIndicator}>✓</div>}
                    </div>
                    <span className={styles.cardTitle} title={item.label}>
                      {shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo upload */}
          <div className={styles.controlGroup}>
            <label className={styles.groupTitle}>3. Sua Foto</label>
            <label className={styles.uploadBtn}>
              <span>{photoUrl ? "🔄 Trocar Foto" : "📷 Selecionar Foto do Dispositivo"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => onFile(event.target.files?.[0])}
                disabled={processingPhoto}
              />
            </label>
            {processingPhoto && <span className={styles.processingText}>Processando foto localmente…</span>}
          </div>

          {photoUrl && (
            <div className={styles.controlGroup}>
              <div className={styles.zoomHeader}>
                <label className={styles.groupTitle}>Ajustar Zoom</label>
                <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
              </div>
              <div className={styles.zoomControls}>
                <button
                  type="button"
                  className={styles.zoomStepBtn}
                  onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                  aria-label="Diminuir zoom"
                >
                  -
                </button>
                <input
                  type="range"
                  min={1}
                  max={3.5}
                  step={0.02}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className={styles.zoomSlider}
                  aria-label="Controle deslizante de zoom"
                />
                <button
                  type="button"
                  className={styles.zoomStepBtn}
                  onClick={() => setZoom((z) => Math.min(3.5, z + 0.1))}
                  aria-label="Aumentar zoom"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {error && <p className={styles.errorBanner} role="alert">{error}</p>}

          <button
            type="button"
            className={styles.exportBtn}
            disabled={!photoUrl || !cropPixels || exporting}
            onClick={exportCurrent}
          >
            {exporting
              ? "Gerando foto em alta resolução…"
              : `Baixar Foto em Alta Definição (${template?.width ?? 1080}×${template?.height ?? 1080})`}
          </button>

          <p className={styles.privacyBadge}>
            🔒 Sua foto é processada no seu dispositivo e não é enviada para o servidor.
          </p>
        </section>

        {/* Right Column: Large Interactive Preview */}
        <section className={styles.previewPanel}>
          <div className={styles.previewCard}>
            <div className={styles.previewTopBar}>
              <span className={styles.previewTitle}>Prévia em Tempo Real</span>
              <span className={styles.dimensionsBadge}>
                {template?.width}×{template?.height} px · {template?.cropShape === "round" ? "Circular" : "Quadrada"}
              </span>
            </div>

            <div
              className={styles.cropperViewport}
              style={{
                aspectRatio: selection.format === "story" ? "9 / 16" : "1 / 1",
                maxWidth: selection.format === "story" ? "340px" : "480px",
              }}
            >
              {photoUrl ? (
                <div className={styles.cropperWrapper}>
                  <Cropper
                    key={selection.format} // Preserves cropper instance when changing template in same format!
                    image={photoUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    cropShape={template?.cropShape === "round" ? "round" : "rect"}
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, pixels) => setCropPixels(pixels)}
                  />
                  {overlayLayer && (
                    <Image
                      src={overlayLayer.src}
                      alt="Moldura da campanha"
                      fill
                      unoptimized
                      className={styles.cropperFrameOverlay}
                    />
                  )}
                </div>
              ) : (
                <label className={styles.emptyDropzone}>
                  <span className={styles.emptyEmoji}>📸</span>
                  <strong>Toque aqui para escolher uma foto</strong>
                  <p className={styles.emptyHint}>
                    Arraste ou selecione uma imagem do seu computador ou celular.
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => onFile(event.target.files?.[0])}
                    className={styles.hiddenFileInput}
                  />
                </label>
              )}
            </div>

            {photoUrl && (
              <p className={styles.previewInstruction}>
                👆 Arraste para posicionar o rosto e use o controle deslizante para dar zoom.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
