import { expect, test } from "@playwright/test";
import {
	completeEmailOtpAndWaitForPostAuth,
	signOutViaApi,
} from "./auth/flows";
import {
	completeCreateWorkspace,
	completeOnboardingSkipDomain,
	expectDashboardHome,
	signUpToOnboarding,
	skipDomainStep,
} from "./onboarding/flows";
import { dashboardURL } from "./runtime";

// Full signup + multi-step onboarding needs more headroom than pure auth UI.
test.describe.configure({ timeout: 120_000 });

test.describe("onboarding — new account", () => {
	test("new signup always lands on onboarding step 1", async ({ page }) => {
		await signUpToOnboarding(page);

		await expect(page).toHaveURL((url) => {
			return (
				url.pathname.includes("/onboarding") &&
				(url.searchParams.get("step") === "1" || !url.searchParams.has("step"))
			);
		});
		await expect(
			page.getByRole("heading", { name: "Create your workspace" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Create workspace" }),
		).toBeDisabled();
	});

	test("create workspace advances to add-domain step", async ({ page }) => {
		const { companyName } = await signUpToOnboarding(page);
		await completeCreateWorkspace(page, companyName);

		await expect(page).toHaveURL((url) => {
			return (
				url.pathname.includes("/onboarding") &&
				url.searchParams.get("step") === "2"
			);
		});
		await expect(
			page.getByRole("heading", { name: "Add Domain" }),
		).toBeVisible();
		await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Add Domain" }),
		).toBeVisible();
	});

	test("skip domain jumps to API key step", async ({ page }) => {
		const { companyName } = await signUpToOnboarding(page);
		await completeCreateWorkspace(page, companyName);
		await skipDomainStep(page);

		await expect(
			page.getByRole("heading", { name: "Generate API key" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Create API key" }),
		).toBeVisible();
	});

	test("full onboarding lands on dashboard; re-login stays on dashboard", async ({
		page,
	}) => {
		// One full path covers: new user → onboarding → home, and the
		// "already completed" routing rule on subsequent login.
		const { companyName, email } = await completeOnboardingSkipDomain(page);

		await expectDashboardHome(page, companyName, email);

		await signOutViaApi(page);
		await page.goto(dashboardURL("/login"), { waitUntil: "domcontentloaded" });

		await completeEmailOtpAndWaitForPostAuth(page, {
			email,
			mode: "login",
		});

		// Org exists → post-auth destination is home, not onboarding.
		await expectDashboardHome(page, companyName, email);
		await expect(page).not.toHaveURL(/onboarding/);
	});
});

test.describe("onboarding — gates", () => {
	test("anonymous visit to /onboarding redirects to login", async ({
		page,
	}) => {
		await page.goto(dashboardURL("/onboarding"), {
			waitUntil: "domcontentloaded",
		});

		await expect(page).toHaveURL(
			(url) =>
				url.pathname === "/dashboard/login" ||
				url.pathname === "/dashboard/login/",
			{ timeout: 20_000 },
		);
	});
});
