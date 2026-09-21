# Skill: image-engine

Use this skill for crop math, decoding, Canvas composition, performance and export.

## Procedure

1. Read `AGENTS.md`, `docs/ARCHITECTURE.md` and `docs/TEMPLATE-SPEC.md`.
2. Keep rendering independent from campaign identity.
3. Render final images on a target-resolution canvas, never by screenshotting the responsive preview.
4. Preserve source aspect ratio. Use crop/cover math; never stretch.
5. Prefer `ImageBitmap`/decoded image reuse for multi-format work.
6. Prefer `toBlob()` for output.
7. Add/adjust unit tests for every geometry change.

## Performance checks

- Avoid Base64 copies for large images.
- Avoid rendering final resolution on every slider movement.
- Revoke object URLs.
- Downscale huge camera originals before repeated renders.
- Consider Worker + OffscreenCanvas only after the basic engine is measured.
