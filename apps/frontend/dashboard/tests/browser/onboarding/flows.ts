import { expect, type Page } from "@playwright/test";
import { uniqueTestEmail } from "../auth/fixtures";
import { completeEmailOtpAndWaitForPostAuth } from "../auth/flows";
import { dashboardURL } from "../runtime";

export type OnboardingWorkspace = {
	email: string;
	companyName: string;
};

/**
 * Sign up a brand-new user and land on onboarding step 1.
 * New accounts have no org → post-auth destination is always /onboarding.
 */
export async function signUpToOnboarding(
	page: Page,
	options?: { email?: string },
): Promise<OnboardingWorkspace> {
	const email = options?.email ?? uniqueTestEmail("onboard");
	const companyName = `E2E Workspace ${Date.now().toString(36)}`;

	await completeEmailOtpAndWaitForPostAuth(page, {
		email,
		mode: "signup",
	});

	await expect(page).toHaveURL((url) => url.pathname.includes("/onboarding"), {
		timeout: 15_000,
	});
	// Step indicator uses NumberFlow (split text nodes) — assert by form chrome.
	await expect(
		page.getByRole("heading", { name: "Create your account" }),
	).toBeVisible({ timeout: 15_000 });
	await expect(page.getByPlaceholder("e.g. Acme Corp")).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Create organization" }),
	).toBeVisible();

	return { email, companyName };
}

/**
 * Step 1 — Create organization (company name is required; referral is optional).
 */
export async function completeCreateWorkspace(page: Page, companyName: string) {
	await page.getByPlaceholder("e.g. Acme Corp").fill(companyName);

	const create = page.getByRole("button", { name: "Create organization" });
	await expect(create).toBeEnabled({ timeout: 5_000 });
	await create.click({ force: true });

	await expect(page.getByRole("heading", { name: "Add Domain" })).toBeVisible({
		timeout: 30_000,
	});
	await expect(page).toHaveURL((url) => url.searchParams.get("step") === "2", {
		timeout: 10_000,
	});
}

/**
 * Step 2 skip → jumps to step 4 (API key). Avoids depending on domain service.
 */
export async function skipDomainStep(page: Page) {
	await page.getByRole("button", { name: "Skip" }).click({ force: true });

	await expect(
		page.getByRole("heading", { name: "Generate API key" }),
	).toBeVisible({ timeout: 15_000 });
	await expect(page).toHaveURL((url) => {
		return (
			url.pathname.includes("/onboarding") &&
			url.searchParams.get("step") === "4" &&
			url.searchParams.get("skippedDns") === "true"
		);
	});
}

/**
 * Step 4 — generate key then leave onboarding for the dashboard home.
 *
 * FancyButton + Framer Motion re-mount the label; force-click avoids
 * "element is not stable / detached" flakes on the CTA.
 */
export async function completeApiKeyAndGoToDashboard(
	page: Page,
	companyName: string,
	userEmail?: string,
) {
	await expect(
		page.getByRole("heading", { name: "Create your API key" }),
	).toBeVisible({ timeout: 15_000 });

	const createKey = page.getByRole("button", { name: "Create API key" });
	await expect(createKey).toBeVisible();
	await createKey.click({ force: true });

	await expect(
		page.getByRole("heading", { name: "API Key", exact: true }),
	).toBeVisible({ timeout: 30_000 });
	await expect(
		page.getByText("Your API key — copy it now, you won't see it again."),
	).toBeVisible();

	// Skip the optional test send and open the dashboard.
	const skip = page.getByRole("button", { name: "Skip" });
	await expect(skip).toBeVisible();
	await skip.click({ force: true });

	// Loading state lives inside the CTA while session/org cache warms.
	await expect(
		page.getByRole("button", { name: "Opening dashboard..." }),
	).toBeVisible({ timeout: 10_000 });

	// Client nav from onboarding can race Next instant validation; if we remain
	// on /onboarding after the click, hard-navigate home (session + org already exist).
	try {
		await expect(page).toHaveURL(
			(url) => {
				const path = url.pathname.replace(/\/$/, "") || "/";
				return path === "/dashboard" && !url.pathname.includes("/onboarding");
			},
			{ timeout: 20_000 },
		);
	} catch {
		await page.goto(dashboardURL("/"), { waitUntil: "domcontentloaded" });
		await expect(page).toHaveURL(
			(url) => {
				const path = url.pathname.replace(/\/$/, "") || "/";
				return path === "/dashboard" && !url.pathname.includes("/onboarding");
			},
			{ timeout: 20_000 },
		);
	}

	await expectDashboardHome(page, companyName, userEmail);
}

/**
 * Full happy path for a new account: auth → onboarding (skip DNS) → home.
 */
export async function completeOnboardingSkipDomain(
	page: Page,
	options?: { email?: string },
): Promise<OnboardingWorkspace> {
	const workspace = await signUpToOnboarding(page, options);
	await completeCreateWorkspace(page, workspace.companyName);
	await skipDomainStep(page);
	await completeApiKeyAndGoToDashboard(
		page,
		workspace.companyName,
		workspace.email,
	);
	return workspace;
}

/** Assert we are on dashboard home (completed onboarding), not onboarding. */
export async function expectDashboardHome(
	page: Page,
	companyName?: string,
	userEmail?: string,
) {
	await expect(page).toHaveURL(
		(url) => {
			const path = url.pathname.replace(/\/$/, "") || "/";
			return path === "/dashboard";
		},
		{ timeout: 20_000 },
	);

	// Prefer the account heading — org name can lag while the list hydrates
	// (ActiveOrganization may briefly expose a stub with name "").
	if (userEmail) {
		await expect(
			page.getByRole("heading", {
				name: `${userEmail}'s Account`,
			}),
		).toBeVisible({ timeout: 20_000 });
	} else {
		await expect(
			page.getByRole("heading", { name: /'s Account$/ }),
		).toBeVisible({ timeout: 20_000 });
	}

	if (companyName) {
		// Org switcher button or home greeting paragraph.
		await expect(
			page.getByText(companyName, { exact: true }).first(),
		).toBeVisible({ timeout: 20_000 });
	}
}

/** Soft navigation helper for re-login checks. */
export async function gotoLogin(page: Page) {
	await page.goto(dashboardURL("/login"), { waitUntil: "domcontentloaded" });
}
