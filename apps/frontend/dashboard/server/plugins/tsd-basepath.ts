/**
 * @tanstack/devtools-vite hardcodes client endpoints as `/__tsd/...`.
 *
 * This app runs behind Caddy with `vite.base = /dashboard/`, so only
 * `/dashboard*` is reverse-proxied to the Vite server (port 3001). Bare
 * `/__tsd/*` falls through to the Next marketing app → 404.
 *
 * Rewrite injected TSD client paths to live under the dashboard base so
 * console-pipe / open-source hit Vite:
 *   /__tsd/console-pipe → /dashboard/__tsd/console-pipe
 *
 * Vite's TSD middleware matches via `url.includes('__tsd/...')`, so the
 * prefixed path still works.
 */
import type { Plugin } from "vite";

const DEFAULT_BASE = "/dashboard";

export function tsdBasepathPlugin(base = DEFAULT_BASE): Plugin {
	const normalized = base.replace(/\/$/, "") || DEFAULT_BASE;

	return {
		name: "reloop:tsd-basepath",
		// After @tanstack/devtools:console-pipe-transform (enforce: 'pre')
		enforce: "post",
		apply(_config, { command }) {
			return command === "serve";
		},
		transform(code) {
			// Fast path: only touch files that received the TSD console pipe inject
			// or other absolute `/__tsd/` client endpoints.
			if (!code.includes("/__tsd/")) return;

			const rewritten = code
				// '/__tsd/...' and "/__tsd/..."
				.replaceAll("'/__tsd/", `'${normalized}/__tsd/`)
				.replaceAll('"/__tsd/', `"${normalized}/__tsd/`)
				// origin + '/__tsd/open-source?...'
				.replaceAll(
					"origin + '/__tsd/",
					`origin + '${normalized}/__tsd/`,
				)
				.replaceAll(
					'origin + "/__tsd/',
					`origin + "${normalized}/__tsd/`,
				);

			if (rewritten === code) return;
			return { code: rewritten, map: null };
		},
	};
}
