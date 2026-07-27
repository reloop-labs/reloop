import { defineConfig, devices } from "@playwright/test";
import { dashboardBaseURL } from "./tests/browser/runtime";

/**
 * Auth E2E targets the real local stack (Caddy + dashboard + auth).
 * Cookies only work on https://local.reloop.sh — not bare localhost:3001.
 *
 * Prerequisites: local/bootstrap, be:auth:dev, fe:dashboard:dev
 * See tests/browser/README.md
 */
export default defineConfig({
	testDir: "./tests/browser",
	testMatch: "**/*.e2e.ts",
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	// Serial by default — auth mutates sessions/cookies against a shared stack.
	workers: 1,
	timeout: 60_000,
	expect: {
		timeout: 15_000,
	},
	reporter: process.env.CI ? [["github"], ["list"]] : "list",
	use: {
		baseURL: dashboardBaseURL,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
		// Local mkcert certs for local.reloop.sh
		ignoreHTTPSErrors: true,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	// Fail fast with a clear message if the local stack is down.
	globalSetup: "./tests/browser/global-setup.ts",
});
