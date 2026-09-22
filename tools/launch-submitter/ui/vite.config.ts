import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	root,
	plugins: [react()],
	server: {
		port: 5173,
		proxy: {
			"/health": "http://127.0.0.1:8787",
			"/products": "http://127.0.0.1:8787",
			"/directories": "http://127.0.0.1:8787",
			"/plan": "http://127.0.0.1:8787",
			"/runs": "http://127.0.0.1:8787",
			"/resume": "http://127.0.0.1:8787",
			"/login": "http://127.0.0.1:8787",
		},
	},
	resolve: {
		alias: {
			"@": path.join(root, "src"),
		},
	},
});
