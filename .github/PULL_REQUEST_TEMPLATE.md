## Summary

<!-- What changed and why. Keep it to 2–5 sentences. -->

## Linked issue

<!-- e.g. Closes #123. Required for significant changes (features, refactors, arch changes) per CONTRIBUTING.md. Small fixes may skip with a note why. -->

Closes #

## Type of change

<!-- Match your branch prefix and commit type. Check all that apply. -->

- [ ] `fix` — bug fix
- [ ] `feat` — new feature
- [ ] `docs` — documentation only
- [ ] `refactor` — no feature or fix
- [ ] `perf` — performance improvement
- [ ] `test` — adding or updating tests
- [ ] `chore` — tooling, CI, dependencies

## Affected areas

<!-- List services/apps/packages touched, e.g. be-webhook, fe-dashboard, @reloop/auth, install/. -->

-

## How tested

<!-- Commands you ran and results. At minimum: `bun run check`. Include service tests for backend changes. -->

```bash
bun run check
# e.g. bun --filter be-webhook test
```

## Screenshots / recordings

<!-- Required for UI changes. Delete this section for backend-only PRs. -->

## Deploy / breaking notes

<!-- Delete if none. Call out migrations (`db:migrate`), new env vars, installer changes, or anything self-hosters must do on upgrade. -->

None.

## Checklist

- [ ] Linked the related issue above (or noted why none is needed)
- [ ] `bun run check` passes (lint + format)
- [ ] Tests added or updated where it matters; affected service tests pass
- [ ] No secrets, API keys, tokens, or PII in the diff
- [ ] New backend endpoints include OpenAPI/Swagger annotations (or N/A)
- [ ] Docs updated if behaviour, setup, ports, or env vars changed (or N/A)
- [ ] Follows the [Code of Conduct](https://github.com/reloop-labs/reloop/blob/main/CODE_OF_CONDUCT.md)
