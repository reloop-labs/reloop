# @reloop/code-samples

Canonical home for multi-language API SDK code samples used by:

- Backend OpenAPI (`x-codeSamples`)
- Docs (API reference MDX sync + learn pages)
- Dashboard API details drawers (via sync or direct import)

## Edit here only

Do **not** co-locate sample bodies under `apps/backend/**` or hand-copy them into dashboard/docs.

```
packages/code-samples/src/{service}/.../{operation}.ts
```

Each file exports a `CodeSample[]` (OpenAPI-compatible `{ id, lang, label, source }`).

## Consumers

```ts
import { createApiKeyXCodeSamples } from "@reloop/code-samples/api-key";
import { createContactXCodeSamples } from "@reloop/code-samples/contacts";
```

## Sync scripts

Until all surfaces import the package directly:

```bash
bun run sync:sdk-samples        # refresh dashboard + docs MDX
bun run sync:sdk-samples:check  # CI
```
