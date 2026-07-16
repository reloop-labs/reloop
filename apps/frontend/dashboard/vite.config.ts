import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const base = "/dashboard/";
const rootDir = path.dirname(fileURLToPath(import.meta.url));

const config = defineConfig({
	base,
	resolve: {
		tsconfigPaths: true,
		// Bright depends on `server-only` (Next RSC). Stub it for Vite client bundles.
		alias: {
			"server-only": path.resolve(rootDir, "src/lib/empty-module.ts"),
		},
	},
	define: {
		// @reloop/auth reads process.env at module init (not import.meta.env).
		// Vite only exposes VITE_* via import.meta.env; inject for the auth package.
		"process.env.VITE_PUBLIC_URL": JSON.stringify(process.env.VITE_PUBLIC_URL || ""),
	},
	plugins: [
		devtools(),
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		tailwindcss(),
		tanstackStart({
			router: {
				basepath: "/dashboard",
			},
		}),
		viteReact(),
	],
	server: {
		// Listen on all interfaces so reverse proxies (Caddy, Coolify, etc.) can reach us.
		// Default Vite bind is localhost-only, which returns 502 via local.reloop.sh.
		host: "0.0.0.0",
		port: 3001,
		strictPort: true,
		// Allow any Host header (local, preview, and production domains).
		// Restricting this caused 502s behind deploy reverse proxies.
		allowedHosts: true,
	},
	preview: {
		host: "0.0.0.0",
		port: 3001,
		strictPort: true,
		allowedHosts: true,
	},
});

export default config;
