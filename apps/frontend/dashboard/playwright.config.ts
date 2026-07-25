import { defineConfig, devices } from "@playwright/test";
import { dashboardBaseURL, dashboardURL } from "./tests/browser/runtime";

const hasExternalServer =
	Boolean(
		process.env.DASHBOARD_E2E_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL,
	) || process.env.DASHBOARD_E2E_SKIP_WEBSERVER === "1";

export default defineConfig({
	testDir: "./tests/browser",
	testMatch: "**/*.e2e.ts",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : 4,
	expect: {
		timeout: 15_000,
	},
	reporter: process.env.CI ? [["github"], ["list"]] : "list",
	use: {
		baseURL: dashboardBaseURL,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	webServer: hasExternalServer
		? undefined
		: {
				command: "node tests/browser/start-standalone.mjs",
				url: dashboardURL("/healthz"),
				reuseExistingServer: !process.env.CI,
				timeout: 120_000,
			},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
