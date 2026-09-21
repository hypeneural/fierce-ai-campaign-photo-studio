# Skill: privacy-security

Use this skill before adding uploads, analytics, persistence, authentication or CRM integration.

## Public photos

Default: local browser processing only.

A change that sends a user photo to a server requires:
- an explicit product requirement;
- a new ADR;
- retention/deletion design;
- authorization and storage review;
- updated privacy documentation.

## Input rules

Public photos: JPEG, PNG, WebP only. Validate bytes/dimensions before production. Never accept public SVG.

## Analytics

Keep anonymous/aggregate product telemetry separate from identifiable contact records. Do not store image contents or EXIF in analytics.
