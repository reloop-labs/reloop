import { expect, test } from "@playwright/test";
import { DEFAULT_OTP, INVALID_OTP, uniqueTestEmail } from "./auth/fixtures";
import {
	completeEmailOtpAndWaitForPostAuth,
	completeEmailOtpAuth,
	signOutViaApi,
} from "./auth/flows";
import { dashboardURL } from "./runtime";

test.describe("auth UI — unauthenticated", () => {
	test("login page shows social options, email field, and signup link", async ({
		page,
	}) => {
		await page.goto(dashboardURL("/login"), { waitUntil: "domcontentloaded" });

		await expect(
			page.getByRole("heading", { name: "Sign in to Reloop" }),
		).toBeVisible();
		await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
		await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
		await expect(page.getByPlaceholder("steve@apple.com")).toBeVisible();
		await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
	});

	test("signup page shows social options, email field, and login link", async ({
		page,
	}) => {
		await page.goto(dashboardURL("/signup"), { waitUntil: "domcontentloaded" });

		await expect(
			page.getByRole("heading", { name: "Create your account" }),
		).toBeVisible();
		await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
		await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
		await expect(page.getByPlaceholder("steve@apple.com")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Create account" }),
		).toBeVisible();
		await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
	});

	test("email step keeps submit disabled for invalid email", async ({
		page,
	}) => {
		await page.goto(dashboardURL("/login"), { waitUntil: "domcontentloaded" });

		const emailInput = page.getByPlaceholder("steve@apple.com");
		await emailInput.fill("not-an-email");

		const submit = page.getByRole("button", { name: "Sign in" });
		await expect(submit).toBeDisabled();
		await expect(
			page.getByText("Please enter a valid email address"),
		).toBeVisible();
	});

	test("protected route redirects anonymous users to login", async ({
		page,
	}) => {
		await page.goto(dashboardURL("/"), { waitUntil: "domcontentloaded" });

		await expect(page).toHaveURL(
			(url) =>
				url.pathname === "/dashboard/login" ||
				url.pathname === "/dashboard/login/",
			{ timeout: 20_000 },
		);
	});

	test("login and signup cross-links navigate between auth pages", async ({
		page,
	}) => {
		await page.goto(dashboardURL("/login"), { waitUntil: "domcontentloaded" });
		await page.getByRole("link", { name: "Sign up" }).click();
		await expect(page).toHaveURL((url) => url.pathname.includes("/signup"));

		await page.getByRole("link", { name: "Login" }).click();
		await expect(page).toHaveURL((url) => url.pathname.includes("/login"));
	});

	test("inviteId deep link is present on the login URL", async ({ page }) => {
		await page.goto(dashboardURL("/login?inviteId=invite-e2e-001"), {
			waitUntil: "domcontentloaded",
		});

		await expect(page).toHaveURL((url) => {
			return (
				url.pathname.includes("/login") &&
				url.searchParams.get("inviteId") === "invite-e2e-001"
			);
		});
		await expect(
			page.getByRole("heading", { name: "Sign in to Reloop" }),
		).toBeVisible();
	});
});

test.describe("auth OTP — real backend", () => {
	test("login with DEFAULT_OTP lands on onboarding for a new user", async ({
		page,
	}) => {
		const email = uniqueTestEmail("login");

		await completeEmailOtpAndWaitForPostAuth(page, {
			email,
			mode: "login",
			otp: DEFAULT_OTP,
		});

		await expect(page).toHaveURL(
			(url) => url.pathname.includes("/onboarding"),
			{
				timeout: 5_000,
			},
		);
	});

	test("signup with DEFAULT_OTP lands on onboarding for a new user", async ({
		page,
	}) => {
		const email = uniqueTestEmail("signup");

		await completeEmailOtpAndWaitForPostAuth(page, {
			email,
			mode: "signup",
			otp: DEFAULT_OTP,
		});

		await expect(page).toHaveURL(
			(url) => url.pathname.includes("/onboarding"),
			{
				timeout: 5_000,
			},
		);
	});

	test("invalid OTP shows an error and stays on verify step", async ({
		page,
	}) => {
		const email = uniqueTestEmail("bad-otp");

		await completeEmailOtpAuth(page, {
			email,
			mode: "login",
			otp: INVALID_OTP,
		});

		await expect(
			page.getByText(/invalid verification code|invalid|try again/i),
		).toBeVisible({ timeout: 15_000 });

		// Still on login verify flow (otpSent query), not post-auth.
		await expect(page).toHaveURL((url) => {
			return (
				url.pathname.includes("/login") &&
				(url.searchParams.has("otpSent") || url.searchParams.has("enterCode"))
			);
		});
	});

	test("session survives reload; sign-out returns to login", async ({
		page,
	}) => {
		const email = uniqueTestEmail("session");

		await completeEmailOtpAndWaitForPostAuth(page, {
			email,
			mode: "login",
			otp: DEFAULT_OTP,
		});

		await expect(page).toHaveURL((url) => url.pathname.includes("/onboarding"));

		await page.reload({ waitUntil: "domcontentloaded" });
		await expect(page).toHaveURL(
			(url) => url.pathname.includes("/onboarding"),
			{
				timeout: 20_000,
			},
		);

		await signOutViaApi(page);

		// Clear client RQ cache by full navigation after cookie clear.
		await page.goto(dashboardURL("/"), { waitUntil: "domcontentloaded" });
		await expect(page).toHaveURL(
			(url) =>
				url.pathname === "/dashboard/login" ||
				url.pathname === "/dashboard/login/",
			{ timeout: 20_000 },
		);
	});
});
