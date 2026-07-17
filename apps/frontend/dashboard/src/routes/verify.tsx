import { createFileRoute } from "@tanstack/react-router";
import { AutoLoginPage } from "#/features/auth/verify/auto-login-page";

/**
 * Magic-link target for OTP emails:
 * `/dashboard/verify?otpSent=user@example.com&otp=123456`
 *
 * Search params are read via nuqs in the page (not validateSearch) so pure-digit
 * OTP codes stay URL strings — TanStack's JSON search parser would coerce
 * `otp=123456` to a number and rewrite the URL.
 */
export const Route = createFileRoute("/verify")({
	component: AutoLoginPage,
	head: () => ({
		meta: [{ title: "Verify | Reloop Dashboard" }],
	}),
});
