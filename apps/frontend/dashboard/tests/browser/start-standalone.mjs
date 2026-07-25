import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dashboardRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const standaloneRoot = resolve(
	dashboardRoot,
	".next/standalone/apps/frontend/dashboard",
);
const serverEntry = resolve(standaloneRoot, "server.js");

if (!existsSync(serverEntry)) {
	throw new Error(
		"Standalone dashboard build is missing. Run `bun run build` before Playwright.",
	);
}

// Next intentionally leaves public/static assets outside the standalone trace.
// Mirror the Docker image layout before starting the exact standalone server.
cpSync(
	resolve(dashboardRoot, ".next/static"),
	resolve(standaloneRoot, ".next/static"),
	{ recursive: true, force: true },
);
cpSync(resolve(dashboardRoot, "public"), resolve(standaloneRoot, "public"), {
	recursive: true,
	force: true,
});

process.env.PORT ||= "3001";
process.env.HOSTNAME ||= "127.0.0.1";

await import(pathToFileURL(serverEntry).href);
