# Goblin Fashion Engine UI Architecture (Current State)

Last verified: March 31, 2026

## Purpose
`goblin-fashion-engine-ui` is an Angular 19 standalone SPA that authenticates with Firebase and loads inventory from the backend API.

The frontend enforces this layering rule:

`Backend DTO -> Adapter -> Frontend Model -> UI`

## Runtime Composition
- Entry point: `src/main.ts`
- App providers: `src/app/app.config.ts`
- Routing: `src/app/app.routes.ts`

Routes:
- `/login` -> `LoginPageComponent` (email/username+password or Google)
- `/` -> `DashboardPageComponent` (guarded)
- `/inventory` -> `HoardViewComponent` (guarded)
- `/hoard` -> redirect to `/inventory`
- `/outfits` -> `ClutterMashComponent` (guarded)
- `/rules` -> `QuirkLogicComponent` (guarded)

## Auth and Request Flow
- Firebase app/auth initialization: `src/app/core/firebase/firebase.ts`
- `AuthService` handles auth state, password login, Google login, token retrieval, logout.
- `authGuard` blocks protected routes for unauthenticated sessions.
- `authTokenInterceptor` attaches `Authorization: Bearer <id-token>` to `/api/goblins/**` requests.
- If a protected request has no token, interceptor fails the request with `401` (no pass-through fallback).
- Logout now signs out and navigates to `/login`.

## Data and Service Architecture
Canonical inventory flow:

1. `HoardViewComponent` consumes canonical `Shiny` model only.
2. `HoardService` orchestrates current goblin/hoard lookup.
3. `ShinyApiService` performs HTTP calls and returns backend DTOs (`ShinyResponseDto`) or `void`.
4. `ShinyAdapter` maps DTOs to canonical frontend `Shiny`.
5. `HoardService` returns canonical `Shiny[]` to UI.

Current inventory API operations:
- List shinies for hoard: `GET /api/goblins/{goblinId}/hoards/{hoardId}/shinies`
- Create shiny in hoard: `POST /api/goblins/{goblinId}/hoards/{hoardId}/shinies`
- Update shiny in hoard: `PUT /api/goblins/{goblinId}/hoards/{hoardId}/shinies/{shinyId}`
- Patch shiny in hoard: `PATCH /api/goblins/{goblinId}/hoards/{hoardId}/shinies/{shinyId}`
- Delete shiny in hoard: `DELETE /api/goblins/{goblinId}/hoards/{hoardId}/shinies/{shinyId}`

Key files:
- API service: `src/app/core/api/shiny-api.service.ts`
- DTO contract: `src/app/core/api/dto/shiny-response.dto.ts`
- Create DTO contract: `src/app/core/api/dto/shiny-create-request.dto.ts`
- Adapter layer: `src/app/core/api/adapters/shiny.adapter.ts`
- Orchestration: `src/app/core/api/hoard.service.ts`
- UI consumer: `src/app/features/inventory/hoard-view/hoard-view.component.ts`
- Shared add/edit modal UI: `src/app/features/inventory/hoard-view/shiny-editor-modal/shiny-editor-modal.component.ts`
- Shared detail modal UI: `src/app/features/inventory/hoard-view/shiny-detail-modal/shiny-detail-modal.component.ts`
- Shared filter UI: `src/app/features/inventory/hoard-view/hoard-filters/hoard-filters.component.ts`
- Shared inventory grid UI: `src/app/features/inventory/hoard-view/hoard-inventory-grid/hoard-inventory-grid.component.ts`
- Shared filter contracts: `src/app/features/inventory/hoard-view/hoard-filters.model.ts`
- Shared shiny form model: `src/app/features/inventory/hoard-view/shiny-form.model.ts`
- Hoard state orchestration store: `src/app/features/inventory/hoard-view/hoard-view.store.ts`

Notes on create payload:
- Backend currently validates `ShinyCreateRequestDto.id` as required (`@NotBlank`).
- UI generates a client id (`crypto.randomUUID()` with fallback) before create submit.

## Inventory Detail Modal
`HoardViewComponent` provides a detail modal for each shiny:
- Opens when goblin clicks shiny image or shiny name.
- Detail rendering is delegated to `ShinyDetailModalComponent`.
- Modal header contains shiny `name/id` and close button.
- Desktop layout uses two columns:
  - left: shiny image (or placeholder if missing)
  - right: summary block (`category`, `subcategory`, `primary colour`, `status`, yes/no flags)
- Mobile layout collapses to a single column.
- Full notes render below summary/image with no truncation.
- Remaining attributes render in a detail grid beneath notes.
- Detail grid intentionally omits internal ownership ids (`goblinId`, `hoardId`) for now.
- Modal header also includes `Delete Shiny` with confirmation.
- Modal header includes `Edit Shiny` which opens the edit flow for the selected shiny.
- Successful delete closes the detail modal immediately and removes the item from table state.

## Inventory Create Modal
`HoardViewComponent` includes `Add Shiny` create flow:
- Header action button opens a dedicated create modal.
- Form rendering is delegated to `ShinyEditorModalComponent` (shared with edit flow).
- Form captures all non-auto-generated shiny fields used by the current backend contract.
- `Image Upload` area is intentionally placeholder-only for now (no file upload integration yet).
- On successful create:
  - modal closes
  - new shiny is inserted into local table state
  - filter option lists are rebuilt

## Inventory Edit Flow
`HoardViewComponent` includes `Edit Shiny` support:
- Can be launched from:
  - detail modal header (`Edit Shiny`)
  - overview grid `Actions` menu (`Edit`)
- Uses the shared `ShinyEditorModalComponent` field set and validation path as create flow.
- Chooses endpoint by edit scope:
  - `PATCH` when only patch-safe fields changed (`status`, `imagePath`, `notes`, `includeInEngine`, `attentionLevel`)
  - `PUT` when any full-model fields changed
- On successful edit:
  - modal closes
  - shiny row is replaced in local table state
  - filter option lists are rebuilt

## Overview Grid Row Actions
Overview grid table includes an `Actions` column:
- Row action trigger opens menu with:
  - `Edit` (opens edit modal)
  - `Delete` (confirmation + API delete)

## Inventory Filters
Inventory filtering is rendered by `HoardFiltersComponent`:
- Category/context/status/color select filters.
- Search input for name/id/notes/subcategory/fabric/fit matching.
- Filter state and application logic are managed by `HoardViewStore` and consumed by `HoardViewComponent`.

## Enum and Display Formatting
Enum values are rendered as human-readable labels via a shared formatting layer:
- Utility: `src/app/core/utils/enum-label.util.ts` (`formatEnumLabel`)
- Reusable pipe: `src/app/core/pipes/enum-label.pipe.ts` (`enumLabel`)

Current usage:
- `HoardViewComponent` templates use `| enumLabel` for filter options and enum chips.
- Component logic uses `formatEnumLabel` for modal detail entries and color display labels.

Color presentation in inventory UI:
- Uses swatch + text treatment for `Color` enum values.
- Swatch color is mapped by enum in `HoardViewComponent`.
- Chip container is neutral (swatch carries the color signal).

Flag presentation in detail modal:
- Boolean flags use explicit visual states:
  - `flag-on` for `Yes`
  - `flag-off` for `No`

## Frontend Models
Canonical models in `src/app/core/models` align with backend contract shapes:
- `Goblin`, `Hoard`, `Shiny`, `Clutter`, `Quirk`
- shared enums in `enums.ts`

Rules now enforced:
- UI components do not bind to backend DTOs.
- UI-facing services do not return backend DTOs.
- Mapping logic is centralized in adapter layer.
- No runtime legacy field usage (for example `primaryContext`/`secondaryContext`).
- No runtime inventory reads from `inventory.json`.

## Logging
Frontend logging is structured and privacy-safe:
- Logger: `src/app/core/logging/app-logger.service.ts`
- API request logging: `src/app/core/logging/api-request-logging.interceptor.ts`

Logging behavior:
- No passwords, tokens, raw auth headers, or raw email/username values in logs.
- API endpoint logs sanitize path identifiers.
- Logging is disabled in Karma test runtime to keep test output clean.

## Data Sources
- Runtime inventory source: backend API (`/api/goblins/{goblinId}/hoards/{hoardId}/shinies`).
- Static assets remain under `src/resources/images/**`.
- `inventory.json` is not used as a runtime inventory source.

## Validation Status
Validation run on March 31, 2026:
- `npm run test -- --watch=false --browsers=ChromeHeadless --include src/app/core/api/shiny-api.service.spec.ts`: passing
- `npm run test -- --watch=false --browsers=ChromeHeadless --include src/app/core/api/hoard.service.spec.ts`: passing
- `npm run test -- --watch=false --browsers=ChromeHeadless --include src/app/features/inventory/hoard-view/hoard-view.component.spec.ts`: passing
- `npm run build`: passing
