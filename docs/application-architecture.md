# Goblin Fashion Engine UI: Current Design, Architecture, and Models

## Purpose
`goblin-fashion-engine-ui` is an Angular 19 standalone SPA for browsing a wardrobe inventory ("shinies"), with the current implemented focus on hoard inventory exploration (filtering, sorting, and image preview).

## Tech Stack
- Angular 19 (standalone bootstrap and standalone components)
- TypeScript 5
- Angular Material (`table`, `sort`, `progress-spinner`, `tooltip`)
- Font Awesome (icons)
- SCSS styling
- RxJS Observables for async data flow
- Karma/Jasmine for unit tests

## High-Level Architecture
The codebase follows a feature-oriented frontend structure with shared core services/models:

- `src/app/core`: domain models, API/auth/engine services
- `src/app/features`: route-level feature pages
- `src/app/layout`: shell/navigation components
- `src/resources`: static inventory JSON + image assets

### Layering
1. Presentation layer
- Route components under `features/*`
- Main shell/nav in `app.component.*`
- `HoardViewComponent` is the only feature with substantive UI behavior

2. Application/service layer
- `HoardService` orchestrates inventory retrieval and maps it into a hoard domain object
- `GoblinService` supplies current goblin identity/context

3. Domain/data layer
- Interfaces in `core/models` define data contracts (`Shiny`, `Hoard`, `Goblin`)
- Data source is currently static JSON (`/resources/inventory.json`) rather than a remote backend

## Runtime Composition
- Entry point: `src/main.ts` bootstraps `AppComponent` with `appConfig`
- `app.config.ts` providers:
  - Zone change detection with `eventCoalescing`
  - Angular `HttpClient`
  - Router providers
- Routes (`app.routes.ts`):
  - `/` -> `DashboardPageComponent`
  - `/inventory` -> `HoardViewComponent`
  - `/hoard` -> redirect to `/inventory`
  - `/outfits` -> `ClutterMashComponent`
  - `/rules` -> `QuirkLogicComponent`

## UI Design (Current State)
### App shell and navigation
- Header with app brand + primary nav links
- Router outlet hosts feature pages
- Theming uses Angular Material prebuilt `purple-green` palette and material CSS variables

### Implemented feature: Hoard View
`HoardViewComponent` provides:
- Loading and error states
- Data table (`MatTable`) of `Shiny` items
- Filter controls for:
  - category
  - context (`primaryContext`)
  - status
  - primary color
- Sort controls (`MatSort`) for:
  - category
  - context
  - status
  - color
- Thumbnail image column with modal preview
- Notes truncation with tooltip support
- Empty-state handling when no inventory is returned

### Scaffolded features (placeholder content)
- Dashboard page
- Outfits (`clutter-mash`)
- Rules (`quirk-logic`)
- Layout components (`app-shell`, `navbar`) are scaffolded but not currently used by the app root template

## Data Sources and Asset Pipeline
- Primary inventory source: `src/resources/inventory.json`
- Image assets: `src/resources/images/**`
- Angular build/test asset config maps `src/resources` to `/resources` at runtime, enabling references like:
  - `/resources/inventory.json`
  - `/resources/images/...`

## Service and Data Flow
Current happy path for inventory rendering:

1. `HoardViewComponent.ngOnInit()` calls `HoardService.getShiniesForCurrentHoard()`
2. `HoardService.getCurrentHoard()` asks `GoblinService` for logged-in goblin
3. `HoardService.getHoardById()` fetches `/resources/inventory.json` via `HttpClient`
4. Raw `Shiny[]` is mapped into a `Hoard` object with static metadata (`name: "Main Hoard"`)
5. Component receives `Shiny[]`, builds filter options, applies filters/sort, and renders table

Error handling behavior:
- Missing goblin -> `null` hoard / empty shinies
- Fetch failures -> caught and converted to `null`/`[]`
- Component displays user-friendly error only when subscription errors at component level

## Domain Model Contracts
### `Goblin`
File: `src/app/core/models/goblin.model.ts`
- `id: string`
- `name: string`
- `hoardId: string`

### `Hoard`
File: `src/app/core/models/hoard.model.ts`
- `id: string`
- `name: string`
- `goblinId: string`
- `shinies: Shiny[]`

### `Shiny`
File: `src/app/core/models/shiny.model.ts`

Represents a single inventory item with identity, classification, wear context, style attributes, and lifecycle metadata.

Fields:
- Identity/quantity: `id`, `count`, `filename`
- Classification: `category`, `subcategory`, `layer`
- Usage context: `primaryContext`, `secondaryContext`, `formality`
- Visual/style: `colorPrimary`, `colorSecondary`, `pattern`, `fabric`, `fit`
- Practicality flags: `officeOk`, `publicWear`, `includeInEngine`
- Logistics/media: `imagePath`, `status`, `notes`, `attentionLevel`
- Thermal attribute: `warmth`

### Placeholder model files
- `clutter.model.ts` (currently empty)
- `quirk.model.ts` (currently empty)

These suggest planned expansion for outfit generation/rule logic domains.

## Implemented vs Planned Services
### Implemented logic
- `GoblinService`: returns a hardcoded logged-in goblin (`GBL-001`, `Snarkle`, `HRD-001`)
- `HoardService`: inventory loading, hoard assembly, and fallback handling

### Scaffolded placeholders
- `ApiService`
- `ShinyService`
- `ClutterService`
- `QuirkService`
- `ClutterEngineService`

These classes are registered as injectables but currently contain no behavior.

## Testing Snapshot
The repository includes unit tests for:
- Core model typing (`Goblin`, `Hoard`, `Shiny`)
- `GoblinService`
- `HoardService` (HTTP interactions, null/error fallback paths)
- `HoardViewComponent` (loading/error/empty/render/filter/sort/modal behavior)
- Generated baseline specs for scaffolded components/services

This indicates strongest current validation around inventory browsing behavior.

## Architectural Observations
- The app is currently a local-data UI with domain-friendly abstractions already in place for future backend/engine integration.
- Domain naming (`goblin`, `hoard`, `shiny`, `clutter`, `quirk`) is consistent and suited to future rules/engine expansion.
- The route structure and placeholder services/models suggest a planned roadmap:
  - inventory management (`/inventory`)
  - outfit synthesis (`/outfits`)
  - rules/constraints (`/rules`)

## Known Current Gaps
- No real authentication/session management (hardcoded goblin context)
- No remote API integration yet
- Outfit engine and rule engine are not implemented
- Dashboard/outfits/rules pages are placeholders
- `category` contains a source-data typo (`"Acessories"`) from inventory data that will affect filter display consistency

## Suggested Next Architectural Milestones
1. Introduce typed repository layer (or adapter) between `HoardService` and raw JSON/backend payloads.
2. Define and implement `Clutter` and `Quirk` models/services before building `/outfits` and `/rules` features.
3. Add normalization/validation for incoming `Shiny` data (enum-like value sets, typo cleanup, null/empty handling).
4. Evolve `GoblinService` from hardcoded state to auth/session-backed identity context.
5. Promote feature-level state management patterns as the engine logic grows (component store/signals/facade).
