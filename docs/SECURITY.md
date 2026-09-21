# Security and privacy baseline

## Public image input

Allowlist:
- `image/jpeg`
- `image/png`
- `image/webp`

Do not accept public SVG uploads.

Before production, add checks for:
- file-size limit;
- decoded width/height and megapixel limit;
- file signature / magic bytes;
- safe failure on malformed images;
- memory pressure on mobile devices.

## Photo handling

The MVP uses `URL.createObjectURL(file)` and browser Canvas. Photos are not posted to the application server.

Every created object URL must be revoked.

## Output

Use `canvas.toBlob()` and object URLs for download/share. Avoid Base64 output except for isolated compatibility cases.

## Template assets

Template URLs are repository-controlled. If the future admin supports uploads, validate file type, dimensions, content and authorization server-side.

## Analytics

Track aggregate product events separately from contact/CRM data. Do not persist the user photo in analytics.
