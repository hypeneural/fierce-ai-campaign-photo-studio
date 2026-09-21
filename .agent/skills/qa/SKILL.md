# Skill: qa

Use this skill for validation before merging or handing a build to an external coding agent.

## Required commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:static
```

## Manual matrix

- Desktop Chrome
- Android Chrome
- iPhone Safari
- portrait input photo
- landscape input photo
- square input photo
- avatar output
- Story output
- change template after crop
- replace photo
- repeated export without increasing object URLs indefinitely

## Invariants

- Output dimensions exactly match template dimensions.
- Faces/photos are cropped, never stretched.
- User photo is not sent over network by the editor.
- Overlay remains fixed while only the photo is manipulated.
