# Goblin Fashion Engine UI Architecture (Current State)

Last verified: March 28, 2026

## Purpose
`goblin-fashion-engine-ui` is an Angular 19 standalone SPA for inventory browsing and outfit/rules scaffolding. The frontend contracts now mirror backend domain/DTO contracts from `goblin-fashion-engine-api`, which is the source of truth.

## Tech Stack
- Angular 19 standalone app (`bootstrapApplication`)
- TypeScript 5 with strict compiler settings
- Angular Material (`table`, `sort`, `progress-spinner`, `tooltip`)
- Firebase Web SDK (`auth`, `firestore`, `storage` initialization)
- RxJS for async/service flows
- Font Awesome for iconography
- Karma/Jasmine test setup

## Runtime Composition
- Entry point: `src/main.ts`
- App providers: `src/app/app.config.ts`
- Routing: `src/app/app.routes.ts`

Routes currently configured (lazy loaded):
- `/` -> `DashboardPageComponent`
- `/inventory` -> `HoardViewComponent`
- `/hoard` -> redirect to `/inventory`
- `/outfits` -> `ClutterMashComponent`
- `/rules` -> `QuirkLogicComponent`

## UI Architecture
- App shell/navigation currently lives directly in `AppComponent` (`src/app/app.component.html`).
- Feature pages are organized under `src/app/features/*`.
- `HoardViewComponent` is the primary data-driven feature.
- `DashboardPageComponent`, `ClutterMashComponent`, and `QuirkLogicComponent` are still minimal feature shells.
- Layout components under `src/app/layout/*` remain scaffolded and available for future shell composition.

## Data and Service Architecture
Implemented services:
- `AuthService` (`src/app/core/auth/auth.service.ts`): wraps Firebase auth state and login/logout calls.
- `GoblinService` (`src/app/core/auth/goblin.service.ts`): maps Firebase `User` to backend-aligned `Goblin` contract.
- `HoardService` (`src/app/core/api/hoard.service.ts`): reads inventory source, normalizes legacy inventory records into backend-aligned `Shiny` contracts, and assembles hoard payloads.

Scaffolded (no business logic yet):
- `ApiService`
- `ShinyService`
- `ClutterService`
- `QuirkService`
- `ClutterEngineService`

## Data Sources
- Static inventory source: `src/resources/inventory.json` (served as `/resources/inventory.json`).
- Image assets: `src/resources/images/**`.
- Asset mapping configured in `angular.json` for both build and test targets.

## Domain Contract Alignment
Contracts in `src/app/core/models` now align to backend source contracts:
- `Goblin`, `Hoard`, `Shiny`, `Clutter`, `Quirk`
- Shared enums in `enums.ts` now match backend enum names/values.

Notable backend parity details now enforced in frontend:
- `Attention` naming (replacing legacy `AttentionLevel`).
- `Context` values now match backend list exactly.
- `ClutterSource`, `ClutterStatus`, and `ClutterItemRole` vocabularies match backend.
- `QuirkScopeType`, `QuirkRuleType`, and `QuirkOperator` now match backend semantics.
- Legacy local inventory fields (`primaryContext`, `secondaryContext`, `attentionLevel`, and title-cased enum values) are normalized in `HoardService` before entering the frontend domain model layer.

## Hoard View Behavior
`HoardViewComponent` provides:
- Loading and error UI states.
- Filter controls (category, context, status, color).
- Sort controls (category, context, status, color).
- Material table rendering with sticky header.
- Image thumbnail with click-to-open modal preview.
- Notes cell tooltip support.

## Firebase Integration
- Firebase app initialization exists in `src/app/core/firebase/firebase.ts`.
- Firebase config is sourced from `src/environments/environments.ts`.
- Auth state is consumed via `AuthService.user$`.
- `DashboardPageComponent` includes explicit login/logout buttons wired to `AuthService`.

## Validation Status
Validation run on March 28, 2026:
- `npm run build`: passing.
- `npx ng test --watch=false --browsers=ChromeHeadless`: passing (`36 SUCCESS`).

## Known Follow-Up Opportunity
`HoardService` currently hydrates data from local `inventory.json`. As backend API endpoints expand beyond shiny inventory retrieval, the next architecture step is replacing local-source hydration with full backend API integration while preserving the same frontend contract interfaces.
