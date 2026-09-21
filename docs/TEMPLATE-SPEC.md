# Template specification

Templates are data. The engine must be able to render a new template without adding identity-specific rendering code.

## Stored coordinates

`photoArea` uses normalized coordinates relative to the output canvas:

```ts
{
  x: 0,
  y: 0,
  width: 1,
  height: 1
}
```

means the photo occupies the full canvas.

## Shape

```ts
interface TemplateDefinition {
  id: string;
  identity: "paulinha" | "emerson-stein" | "paulinha-emerson";
  format: "avatar" | "story" | "feed";
  label: string;
  width: number;
  height: number;
  photoArea: NormalizedRect;
  cropShape: "rect" | "round";
  layers: TemplateLayer[];
  export: {
    mime: "image/png" | "image/jpeg";
    quality?: number;
  };
}
```

## Layer ordering

- `background` layers render before the user photo.
- The user photo renders into `photoArea` using cover/crop behavior.
- `overlay` layers render after the user photo.

## Production asset rule

Internal SVG is permitted because it is repository-controlled. SVG supplied by public users is not accepted.
