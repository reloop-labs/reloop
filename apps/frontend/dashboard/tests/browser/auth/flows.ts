import { expect, type Page } from "@playwright/test";
import { dashboardURL } from "../runtime";
import { DEFAULT_OTP } from "./fixtures";

export type AuthMode = "login" | "signup";

function authPath(mode: AuthMode) {
	return mode === "signup" ? "/signup" : "/login";
}

/** input-otp renders a single hidden/visible input that accepts the full code. */
async function fillOtp(page: Page, otp: string) {
	const otpInput = page
		.locator('input[data-input-otp], input[autocomplete="one-time-code"]')
		.first();
	await expect(otpInput).toBeVisible({ timeout: 10_000 });
	await otpInput.click();
	await otpInput.fill(otp);
}

/**
 * Drive email OTP from social step through verification.
 * Does not assert post-auth destination (callers decide).
 */
export async function completeEmailOtpAuth(
	page: Page,
	options: {
		email: string;
		otp?: string;
		mode?: AuthMode;
		/** Query string without leading ? (e.g. inviteId=abc) */
		search?: string;
		/** When true, stop after OTP is sent (before entering the code). */
		stopAfterOtpSent?: boolean;
	},
) {
	const mode = options.mode ?? "login";
	const otp = options.otp ?? DEFAULT_OTP;
	const search = options.search ? `?${options.search.replace(/^\?/, "")}` : "";
	const path = `${authPath(mode)}${search}`;

	await page.goto(dashboardURL(path), { waitUntil: "domcontentloaded" });

	// Login and signup both show email + primary CTA on the first step.
	const emailInput = page.getByPlaceholder("steve@apple.com");
	await expect(emailInput).toBeVisible();
	await emailInput.fill(options.email);
	const submitName = mode === "signup" ? "Create account" : "Sign in";
	const submit = page.getByRole("button", { name: submitName });
	await expect(submit).toBeEnabled({ timeout: 5_000 });
	await submit.click();

	await expect(
		page.getByRole("heading", { name: "Confirm your email" }),
	).toBeVisible({ timeout: 20_000 });
	await expect(page.getByText(options.email, { exact: true })).toBeVisible();

	if (options.stopAfterOtpSent) {
		return;
	}

	// OTP input is always visible — no "Enter code manually" step.
	await fillOtp(page, otp);
}

/**
 * Complete email OTP and wait until we leave public auth routes.
 * New users without orgs land on /onboarding after a ~2s success delay.
 */
export async function completeEmailOtpAndWaitForPostAuth(
	page: Page,
	options: {
		email: string;
		otp?: string;
		mode?: AuthMode;
		search?: string;
	},
) {
	await completeEmailOtpAuth(page, options);

	// Success UI may flash briefly before the 2s navigate, or skip if slow.
	// Accept either the banner or a post-auth URL.
	const verified = page.getByText("Verified successfully!", { exact: true });
	const postAuth = page.waitForURL(
		(url) => {
			const path = url.pathname;
			return (
				path.includes("/onboarding") ||
				path === "/dashboard" ||
				path === "/dashboard/" ||
				(path.startsWith("/dashboard/") &&
					!path.includes("/login") &&
					!path.includes("/signup") &&
					!path.includes("/verify"))
			);
		},
		{ timeout: 30_000 },
	);

	await Promise.race([
		verified
			.waitFor({ state: "visible", timeout: 20_000 })
			.then(() => postAuth),
		postAuth,
	]);

	await expect(page).toHaveURL(
		(url) => {
			const path = url.pathname;
			return (
				path.includes("/onboarding") ||
				path === "/dashboard" ||
				path === "/dashboard/" ||
				(path.startsWith("/dashboard/") &&
					!path.includes("/login") &&
					!path.includes("/signup") &&
					!path.includes("/verify"))
			);
		},
		{ timeout: 5_000 },
	);
}

/**
 * Sign out via Better Auth HTTP API (onboarding has no user menu).
 * Auth middleware requires a browser Origin header.
 */
export async function signOutViaApi(page: Page) {
	const origin = new URL(dashboardURL("/")).origin;
	const response = await page.request.post(`${origin}/api/auth/v1/sign-out`, {
		headers: {
			"Content-Type": "application/json",
			Origin: origin,
			Referer: `${origin}/dashboard/onboarding`,
		},
	});
	// Better Auth may return 200 with empty body or redirect-like status.
	expect(
		response.ok() || response.status() === 204,
		`sign-out failed: ${response.status()} ${await response.text()}`,
	).toBeTruthy();
}
