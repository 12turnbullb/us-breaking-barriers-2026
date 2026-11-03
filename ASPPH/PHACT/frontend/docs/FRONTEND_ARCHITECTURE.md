# PHACT frontend architecture

This frontend preserves the Figma Make page implementations and visual system while adding a backend-ready boundary.

## Runtime shape

- `src/routes.ts` is the authoritative page registry.
- `src/App.tsx` owns `HashRouter`, session state, route-aware page selection, and the app context passed to existing page components.
- `src/components/Layout.tsx` owns the shell, grouped navigation, landmarks, and route-derived labels.
- Existing pages remain in `src/pages/` to minimize visual and interaction regressions.
- `src/api/index.ts` selects exactly one data adapter at startup from `VITE_DATA_MODE`.
- `src/api/mock.ts` is the deterministic local development adapter.
- `src/api/http.ts` is the explicit live boundary. It does not fall back to mock data; unimplemented operations reject with an unavailable error.
- Operational development fixtures live under `src/mocks/fixtures/`.

## Routing

The app uses `HashRouter` so static hosting and refreshes work without server rewrite configuration. Route metadata, paths, labels, roles, and navigation groups are defined once in `src/routes.ts`.

## Data flow

Pages call the selected `api` service boundary and retain their existing local UI state. Mock mode persists demo workflow state in browser storage. Live mode is intentionally conservative until backend contracts are approved.

## Integration boundaries

The frontend never calls AWS services directly and contains no credentials. Backend authentication, presigned uploads, analysis orchestration, persistence, and authorization remain teammate-owned responsibilities.
