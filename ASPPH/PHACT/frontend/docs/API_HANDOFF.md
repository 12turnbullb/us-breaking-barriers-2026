# PHACT API handoff

These are **PROPOSED — NOT YET IMPLEMENTED** contracts for backend review. They are not claims about existing FastAPI routes.

| Operation | Method / path | Frontend dependency | Auth |
| --- | --- | --- | --- |
| Login/session | `POST /auth/session` | Login | Institutional session; backend-owned |
| Current user | `GET /auth/me` | Protected layout | Authenticated user |
| Courses | `GET /courses` | Dashboard, Repository | Faculty-scoped |
| Dashboard | `GET /dashboard` | Dashboard | Faculty-scoped |
| Upload session | `POST /uploads` | Upload | Faculty-scoped; return upload instructions |
| Upload completion | `POST /uploads/{id}/complete` | Upload | Faculty-scoped |
| Create analysis job | `POST /analyses` | Upload | Faculty-scoped |
| Job status | `GET /jobs/{id}` | Progress, Activity | Owner or admin |
| Analysis result | `GET /analyses/{id}` | Recommendations, Mapping, Review, Export | Owner or approved viewer |
| Review mutation | `POST /analyses/{id}/review` | Review | Faculty owner |
| Activity | `GET /activity` | Activity | Faculty-scoped |
| Export | `POST /exports` | Export | Faculty owner |
| Admin queue | `GET /admin/jobs` | AdminQueue | Admin authorization |
| Admin sources | `GET /admin/sources` | AdminSources | Admin authorization |

## Response expectations

All responses should be JSON with stable identifiers, ISO-8601 timestamps, explicit status enums, and structured error bodies such as `{ "code": "...", "message": "...", "requestId": "..." }`. Upload transfer progress and analysis-processing status should be separate fields.

## Contract ownership

Analysis result fields are provisional in `src/api/types.ts` because the shared `contracts/analysis.schema.json` is not present in this frontend-only repository. When it becomes available, generate or map types explicitly rather than silently widening the provisional model.
