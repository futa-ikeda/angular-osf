# Models Conventions

## Purpose

Models are TypeScript interfaces and types that describe data shapes. They are not classes. Mapping from API wire format to app domain happens in mappers.

## Layers

```
JSON:API (*-json-api.model.ts) → mapper → domain model → store (*StateModel) → UI
```

| Layer    | Role                                                   | Naming                                                |
| -------- | ------------------------------------------------------ | ----------------------------------------------------- |
| JSON:API | Wire/DTO shapes from the backend (`snake_case` fields) | `*JsonApi`, `*DataJsonApi`, `*ResponseJsonApi`        |
| Domain   | App-facing shapes (`camelCase` fields)                 | Prefer descriptive names; `*Model` suffix is optional |
| State    | NGXS slice shape                                       | Always `*StateModel`                                  |
| Form     | Reactive form value shapes                             | `*Form`, `*FormGroup`                                 |

Keep JSON:API types in services and mappers. Prefer domain models in stores, selectors, and components.

## Locations

| Location                                 | Use for                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/app/shared/models/<domain>/`        | Cross-feature domain + JSON:API types                                                       |
| `src/app/shared/models/common/json-api/` | Shared JSON:API primitives (`JsonApiResource`, `ItemResponse`, `ListResponse`, links, meta) |
| `src/app/features/<feature>/models/`     | Feature-local UI, form, and API types                                                       |
| `src/app/**/store*/**/*.model.ts`        | Colocated NGXS state models                                                                 |
| `src/app/core/models/`                   | App-wide config and core types                                                              |

## File naming

- Domain / general: `kebab-case.model.ts`
- JSON:API twin: `kebab-case-json-api.model.ts` (dash, not dot)
- Forms: `kebab-case-form.model.ts`
- One concern per file when practical; group related exports in the same domain folder

Examples:

- `user.model.ts` + `user-json-api.model.ts`
- `configured-addon.model.ts` + `configured-addon-json-api.model.ts`

## Symbol naming

- Domain: `UserModel`, `InstitutionUser`, `RegistrationCard` (suffix `Model` is encouraged for primary entities, not required for every interface)
- JSON:API: always end with `JsonApi` (e.g. `UserDataJsonApi`, `UserResponseJsonApi`)
- State: always `*StateModel` (e.g. `AddonsStateModel`, `SubjectsStateModel`)
- Do not put snake_case field names on domain models; map them in the mapper

## Mappers

- Live in `shared/mappers/` or `features/<feature>/mappers/`
- Convert `*JsonApi` → domain models (and domain → request payloads when needed)
- Prefer static mapper classes (`UserMapper.fromUserGetResponse`) or focused `mapX` functions; keep one style within a feature

## Imports

Prefer the `@osf/` alias for app code:

```ts
import { UserModel } from '@osf/shared/models/user/user.model';
import { UserDataJsonApi } from '@osf/shared/models/user/user-json-api.model';
```

Feature barrels are optional. When a feature has `models/index.ts`, import from the barrel:

```ts
import { ModeratorModel } from '@osf/features/moderation/models';
```

Otherwise import the file path directly. Do not mix `@osf/shared/models/...` and `@shared/models/...` in new code — use `@osf/...`.

## State models

Colocate with the store. Compose domain types inside `AsyncStateModel` / `AsyncStateWithTotalCount`:

```ts
export interface FilesStateModel {
  files: AsyncStateModel<FileModel[]>;
}
```

See [NGXS docs](./ngxs.md) for store layout and async state shape.

## Checklist for new models

1. Put shared types under `shared/models/<domain>/`, feature-only types under `features/<feature>/models/`
2. Add a `*-json-api.model.ts` twin only when typing an HTTP payload/response
3. Use interfaces/types, not classes
4. Keep domain fields camelCase; leave snake_case in JSON:API types
5. Map at the service/mapper boundary before storing or rendering
6. Name store interfaces `*StateModel`
7. Import via `@osf/...`
