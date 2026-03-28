# Goblin Fashion Engine UI

Goblin Fashion Engine UI is an Angular 19 application for exploring and managing a wardrobe inventory ("shinies").

Current implemented focus:
- Hoard inventory table view
- Filter and sort controls
- Image thumbnail preview modal
- Firebase app initialization for auth/database/storage integration

## Tech Stack
- Angular 19 (standalone components)
- TypeScript
- Angular Material
- RxJS
- Firebase Web SDK
- Karma/Jasmine unit testing

## Project Structure
- `src/app/features` - route-level feature pages (`dashboard`, `inventory`, `outfits`, `rules`)
- `src/app/core` - shared services, models, auth, and Firebase initialization
- `src/environments` - environment config, including Firebase client config
- `src/resources` - static app resources (inventory/images)

## Run Locally
Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm start
```

App URL:
- `http://localhost:4200/`

## Build
```bash
npm run build
```

## Test
```bash
npm test
```

## Firebase Configuration and Security
Firebase client configuration in this repo is intentionally public.

- Config location: `src/environments/environments.ts`
- Usage: `src/app/core/firebase/firebase.ts`

This is expected for Firebase web apps. These values identify the Firebase project, but they do not grant privileged access by themselves.

Actual data and operation access must be enforced with:
- Firebase Authentication
- Firestore Security Rules
- Storage Security Rules

Security depends on rules and auth, not on hiding client config in frontend code.

## Additional Documentation
- Architecture reference: `docs/architecture.md`

