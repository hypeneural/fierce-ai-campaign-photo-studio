# Skill: template-authoring

Use this skill when adding or changing frame/template definitions.

## Rules

1. Templates are data under `src/templates/` plus trusted assets under `public/templates/`.
2. Do not add `if identity === ...` branches to the renderer.
3. Use normalized `photoArea` coordinates.
4. Set explicit output width/height.
5. Keep production copy/art separate from the rendering engine.
6. A newly published template should receive a new stable ID/version rather than silently changing historic behavior.
7. Verify at minimum avatar and Story exports after shared changes.
