# ADR 0001 — Local-first public photo processing

Status: Accepted

## Decision

The public editor processes participant photos in the browser. The MVP does not upload or persist those photos.

## Why

- Lower privacy and retention surface.
- Faster feedback after initial page load.
- Lower storage/processing cost.
- Server infrastructure remains focused on template/admin data rather than participant images.

## Consequence

Any future server-side photo upload is an architectural change and requires a new ADR plus security/privacy review.
