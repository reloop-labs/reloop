# Dashboard browser parity tests

`route-contract.ts` is the merge-blocking inventory of the 60 unique URLs in
the final TanStack route tree. The smoke suite opens every route as an anonymous
deep link and intercepts every same-origin `/api/**` request with an inert
response, so the crawl cannot reach or mutate backend data.

Run the dashboard production build and suite together:

```sh
bun run test:browser:production
```

By default Playwright copies the public/static assets into the standalone build,
starts its generated server, and waits for
`http://127.0.0.1:3001/dashboard/healthz`. To test an existing deployment,
provide the full dashboard application base URL; an explicit URL disables the
local server:

```sh
DASHBOARD_E2E_BASE_URL=https://staging.example.com/dashboard bun run test:browser
```

`PLAYWRIGHT_BASE_URL` is accepted as an alias.
`DASHBOARD_E2E_SKIP_WEBSERVER=1` disables the managed server without changing
the default URL.
