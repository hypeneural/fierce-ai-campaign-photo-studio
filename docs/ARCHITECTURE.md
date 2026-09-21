# Architecture

## Context

The product must support multiple identities (Paulinha, Emerson Stein, combined) and multiple target formats without cloning the application or rendering engine.

## High-level flow

```text
Campaign / identity
        ↓
Template registry
        ↓
Format + template
        ↓
Local photo selection
        ↓
Crop / zoom transform
        ↓
Preview
        ↓
Final-size Canvas compositor
        ↓
Blob
        ↓
Download / Web Share
```

## Boundaries

### UI
`src/components/studio/` owns interaction state. It may depend on the template registry and image engine.

### Template domain
`src/templates/` owns schema and template definitions. It must not depend on React.

### Image engine
`src/image-engine/` owns rendering/export math. It must not know candidate names or campaign strategy.

### Public assets
`public/templates/` contains only trusted template assets controlled by the team.

## MVP data source

MVP templates are checked into source control. A later admin plane can move these definitions to PostgreSQL/object storage without changing the rendering contract.

## Future admin plane

Recommended entities:

```text
Campaign
  └─ Template
       └─ TemplateVersion

AggregateEvent
```

Public photos remain outside this persistence model by default.

## Preview vs final render

The preview is responsive UI. The final renderer creates a separate canvas at the template target dimensions. A 360px-wide phone preview can therefore still export a true 1080×1920 Story.
