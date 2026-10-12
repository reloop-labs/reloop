import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { LoginPage } from "./client";

export const metadata: Metadata = {
	title: "Log in",
	description:
		"Log in to Reloop to manage sending domains, API keys, inbound email, and campaigns.",
	robots: { index: true, follow: true },
};

export default function LoginRoute() {
	return (
		<Suspense fallback={<AuthSessionLoader />}>
			<LoginPage />
		</Suspense>
	);
}
