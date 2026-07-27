import { readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";
import {
	compatibilityRouteContracts,
	dashboardRouteContracts,
} from "./route-contract";
import { dashboardURL } from "./runtime";

const appDirectory = resolve(
	fileURLToPath(new URL("../../src/app", import.meta.url)),
);

// The .e2e suffix keeps this Playwright suite out of Vitest's default glob.
function collectBrowserErrors(
	page: Page,
	options: { expectedDocument404?: string } = {},
) {
	const errors: string[] = [];

	page.on("console", (message) => {
		if (message.type() === "error") {
			const isExpectedDocument404 =
				options.expectedDocument404 !== undefined &&
				message.location().url === options.expectedDocument404 &&
				message.text() ===
					"Failed to load resource: the server responded with a status of 404 (Not Found)";
			if (isExpectedDocument404) {
				return;
			}
			errors.push(`console: ${message.text()}`);
		}
	});
	page.on("pageerror", (error) => {
		errors.push(`pageerror: ${error.message}`);
	});
	page.on("response", (response) => {
		const url = new URL(response.url());
		if (
			url.pathname.includes("/dashboard/_next/") &&
			response.status() >= 400
		) {
			errors.push(`next-asset: ${response.status()} ${response.url()}`);
		}
	});

	return () => {
		expect(errors, "browser console and page errors").toEqual([]);
	};
}

async function mockAnonymousBackend(page: Page) {
	await page.route("**/api/**", async (route) => {
		// Never forward anonymous smoke traffic to a real backend. An inert
		// success also lets OTP/error UI settle without a synthetic console 405.
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: "null",
		});
	});
}

const authenticatedSession = {
	session: {
		id: "session-1",
		userId: "user-1",
		activeOrganizationId: null,
		expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	user: {
		id: "user-1",
		name: "Dashboard User",
		email: "user@example.com",
		emailVerified: true,
		activeOrganizationId: null,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
};

async function mockAuthenticatedOrglessBackend(
	page: Page,
	options: {
		invitation?: Record<string, unknown>;
		onMutation?: (pathname: string) => void;
		session?: typeof authenticatedSession | null;
	} = {},
) {
	const invitation = options.invitation;

	await page.route("**/api/**", async (route) => {
		const pathname = new URL(route.request().url()).pathname;
		let body: unknown = null;

		if (pathname.endsWith("/get-session")) {
			body =
				options.session === undefined ? authenticatedSession : options.session;
		} else if (pathname.endsWith("/organization/list")) {
			body = [];
		} else if (pathname.endsWith("/organization/list-user-invitations")) {
			body = invitation ? [invitation] : [];
		} else if (pathname.endsWith("/organization/get-invitation")) {
			body = invitation ?? null;
		} else if (
			route.request().method() !== "GET" &&
			pathname.endsWith("/organization/accept-invitation")
		) {
			options.onMutation?.(pathname);
			body = { invitation };
		} else if (
			route.request().method() !== "GET" &&
			(pathname.endsWith("/organization/set-active") ||
				pathname.endsWith("/update-user"))
		) {
			options.onMutation?.(pathname);
			body = { success: true };
		}

		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(body),
		});
	});
}

function collectNextPagePatterns(directory = appDirectory) {
	const pageFiles: string[] = [];

	function walk(currentDirectory: string) {
		for (const entry of readdirSync(currentDirectory, {
			withFileTypes: true,
		})) {
			const path = resolve(currentDirectory, entry.name);
			if (entry.isDirectory()) {
				walk(path);
			} else if (entry.name === "page.tsx") {
				pageFiles.push(path);
			}
		}
	}

	walk(directory);

	return pageFiles
		.map((file) => {
			const segments = relative(directory, file)
				.split(sep)
				.slice(0, -1)
				.filter((segment) => !segment.startsWith("("))
				.map((segment) =>
					segment.replace(
						/^\[([^\]]+)\]$/,
						(_match, name: string) => `$${name}`,
					),
				);
			return segments.length === 0 ? "/" : `/${segments.join("/")}`;
		})
		.sort();
}

test.describe("route contract", () => {
	test("contains exactly 59 unique canonical route patterns", () => {
		const patterns = dashboardRouteContracts.map((route) => route.pattern);
		const samplePaths = dashboardRouteContracts.map(
			(route) => new URL(route.samplePath, "https://contract.invalid").pathname,
		);

		expect(patterns).toHaveLength(59);
		expect(new Set(patterns).size).toBe(59);
		expect(new Set(samplePaths).size).toBe(59);
	});

	test("has one App Router page for every canonical and compatibility route", () => {
		const expectedPatterns = [
			...dashboardRouteContracts.map((route) => route.pattern),
			...compatibilityRouteContracts.map(
				(route) => new URL(route.path, "https://contract.invalid").pathname,
			),
		].sort();

		expect(collectNextPagePatterns()).toEqual(expectedPatterns);
	});

	for (const route of dashboardRouteContracts) {
		test(`${route.pattern} supports an anonymous deep link`, async ({
			page,
		}) => {
			const assertNoBrowserErrors = collectBrowserErrors(page);
			await mockAnonymousBackend(page);

			const response = await page.goto(dashboardURL(route.samplePath), {
				waitUntil: "domcontentloaded",
			});

			expect(response, "deep-link document response").not.toBeNull();
			expect(response?.status(), "deep-link document status").toBeLessThan(400);

			if (route.authentication === "required") {
				const loginURL = new URL(dashboardURL("/login"));
				await expect(page).toHaveURL(
					(url) =>
						url.origin === loginURL.origin &&
						url.pathname === loginURL.pathname &&
						url.search === "",
				);
			} else {
				const expectedURL = new URL(dashboardURL(route.samplePath));
				await expect(page).toHaveURL(
					(url) =>
						url.origin === expectedURL.origin &&
						url.pathname === expectedURL.pathname &&
						url.search === expectedURL.search,
				);
			}

			await page.waitForLoadState("networkidle");
			assertNoBrowserErrors();
		});
	}

	for (const route of compatibilityRouteContracts) {
		test(`${route.path} preserves its query while redirecting`, async ({
			page,
		}) => {
			const assertNoBrowserErrors = collectBrowserErrors(page);
			await mockAnonymousBackend(page);

			const response = await page.goto(dashboardURL(route.path), {
				waitUntil: "domcontentloaded",
			});

			expect(response, "compatibility-route response").not.toBeNull();
			expect(response?.status(), "compatibility-route status").toBeLessThan(
				400,
			);
			await expect(page).toHaveURL(dashboardURL(route.destination));
			await page.waitForLoadState("networkidle");
			assertNoBrowserErrors();
		});
	}
});

test.describe("production shell", () => {
	test("serves the dedicated health endpoint", async ({ request }) => {
		const response = await request.get(dashboardURL("/healthz"));

		expect(response.status()).toBe(200);
		expect(await response.json()).toEqual({ status: "ok" });
	});

	test("serves branded metadata assets under the dashboard base path", async ({
		request,
	}) => {
		const manifestResponse = await request.get(dashboardURL("/manifest.json"));
		expect(manifestResponse.status()).toBe(200);
		expect(await manifestResponse.json()).toMatchObject({
			name: "Reloop",
			short_name: "Reloop",
			start_url: "/dashboard",
		});

		for (const asset of [
			"/favicon.ico",
			"/apple-icon.png",
			"/icon0.svg",
			"/icon1.png",
			"/web-app-manifest-192x192.png",
			"/web-app-manifest-512x512.png",
		]) {
			const response = await request.get(dashboardURL(asset));
			expect(response.status(), asset).toBe(200);
		}
	});

	test("loads JavaScript and CSS from the dashboard-prefixed static path", async ({
		page,
	}) => {
		const assertNoBrowserErrors = collectBrowserErrors(page);
		const staticResponses: Array<{ status: number; url: string }> = [];

		page.on("response", (response) => {
			const url = new URL(response.url());
			if (url.pathname.includes("/dashboard/_next/static/")) {
				staticResponses.push({
					status: response.status(),
					url: response.url(),
				});
			}
		});
		await mockAnonymousBackend(page);
		const response = await page.goto(dashboardURL("/login"), {
			waitUntil: "networkidle",
		});

		expect(response?.status()).toBeLessThan(400);
		expect(
			staticResponses.length,
			"dashboard-prefixed Next static assets",
		).toBeGreaterThan(0);
		expect(
			staticResponses.some(({ url }) => new URL(url).pathname.endsWith(".js")),
			"dashboard-prefixed JavaScript asset",
		).toBe(true);
		expect(
			staticResponses.some(({ url }) => new URL(url).pathname.endsWith(".css")),
			"dashboard-prefixed CSS asset",
		).toBe(true);
		for (const asset of staticResponses) {
			expect(asset.status, asset.url).toBeLessThan(400);
		}
		assertNoBrowserErrors();
	});

	test("renders metadata and a 404 boundary for malformed paths", async ({
		page,
	}) => {
		const malformedURL = dashboardURL("/definitely-not-a-dashboard-route");
		const assertNoBrowserErrors = collectBrowserErrors(page, {
			expectedDocument404: malformedURL,
		});
		await mockAnonymousBackend(page);
		const response = await page.goto(malformedURL, {
			waitUntil: "domcontentloaded",
		});

		expect(response?.status()).toBe(404);
		await expect(
			page.getByRole("heading", { name: "Page not found" }),
		).toBeVisible();
		expect(await page.title()).toBe("Page not found");
		expect(
			await page
				.locator('meta[name="description"]')
				.getAttribute("content"),
		).toBe("The page you're looking for couldn't be found.");
		const robotsDirectives = await page
			.locator('meta[name="robots"]')
			.evaluateAll((elements) =>
				elements.map((element) => element.getAttribute("content")),
			);
		expect(robotsDirectives).toContain("noindex, nofollow");
		assertNoBrowserErrors();
	});

	test("preserves URL strings across client navigation and browser history", async ({
		page,
	}) => {
		const assertNoBrowserErrors = collectBrowserErrors(page);
		await mockAnonymousBackend(page);
		await page.goto(
			dashboardURL("/login?inviteId=invite-001&otp=001234"),
			{ waitUntil: "networkidle" },
		);

		await page.getByRole("link", { name: "Sign up" }).click();
		await expect(page).toHaveURL((url) => {
			return (
				url.pathname === "/dashboard/signup" &&
				url.searchParams.get("inviteId") === "invite-001" &&
				!url.searchParams.has("otp")
			);
		});

		await page.goBack();
		await expect(page).toHaveURL((url) => {
			return (
				url.pathname === "/dashboard/login" &&
				url.searchParams.get("inviteId") === "invite-001" &&
				url.searchParams.get("otp") === "001234"
			);
		});

		await page.goForward();
		await expect(page).toHaveURL(
			dashboardURL("/signup?inviteId=invite-001"),
		);
		assertNoBrowserErrors();
	});
});

test.describe("authenticated organization behavior", () => {
	test("an orgless direct load is globally redirected to onboarding", async ({
		page,
	}) => {
		const assertNoBrowserErrors = collectBrowserErrors(page);
		await mockAuthenticatedOrglessBackend(page);

		await page.goto(dashboardURL("/settings"), {
			waitUntil: "domcontentloaded",
		});

		await expect(page).toHaveURL(dashboardURL("/onboarding"));
		await expect(
			page.getByRole("heading", { name: "Create your workspace" }),
		).toBeVisible();
		assertNoBrowserErrors();
	});

	test("an orgless direct load follows an actionable invitation", async ({
		page,
	}) => {
		const assertNoBrowserErrors = collectBrowserErrors(page);
		const mutations: string[] = [];
		const invitation = {
			id: "invite-001",
			organizationId: "org-001",
			email: "user@example.com",
			role: "member",
			status: "pending",
			expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
			inviterId: "owner-1",
			organizationName: "Invited Workspace",
			inviterEmail: "owner@example.com",
		};
		await mockAuthenticatedOrglessBackend(page, {
			invitation,
			onMutation: (pathname) => mutations.push(pathname),
		});

		await page.goto(dashboardURL("/contacts"), {
			waitUntil: "domcontentloaded",
		});

		await expect(page).toHaveURL(dashboardURL("/invite?id=invite-001"));
		await expect(
			page.getByRole("heading", { name: "Join Invited Workspace" }),
		).toBeVisible();
		await page.getByRole("button", { name: "Accept Invitation" }).click();
		await expect
			.poll(() => mutations, { message: "invitation activation mutations" })
			.toEqual([
				expect.stringMatching(/\/organization\/accept-invitation$/),
				expect.stringMatching(/\/organization\/set-active$/),
				expect.stringMatching(/\/update-user$/),
			]);
		assertNoBrowserErrors();
	});
});

test.describe("invitation handoff", () => {
	test("an anonymous invite preserves its id through login", async ({ page }) => {
		const assertNoBrowserErrors = collectBrowserErrors(page);
		const invitation = {
			id: "invite-001",
			organizationId: "org-001",
			email: "user@example.com",
			role: "member",
			status: "pending",
			expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
			inviterId: "owner-1",
			organizationName: "Invited Workspace",
			inviterEmail: "owner@example.com",
		};
		await mockAuthenticatedOrglessBackend(page, {
			invitation,
			session: null,
		});

		await page.goto(dashboardURL("/invite?id=invite-001"), {
			waitUntil: "domcontentloaded",
		});
		await page.getByRole("button", { name: "Login to Accept" }).click();

		await expect(page).toHaveURL(dashboardURL("/login?inviteId=invite-001"));
		assertNoBrowserErrors();
	});
});
