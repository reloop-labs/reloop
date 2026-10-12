import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { SignupPage } from "./client";

export const metadata: Metadata = {
	title: "Sign up",
	description:
		"Create a free Reloop account. Open-source email API for transactional email, inbound email, and campaigns.",
	robots: { index: true, follow: true },
};

export default function SignupRoute() {
	return (
		<Suspense fallback={<AuthSessionLoader />}>
			<SignupPage />
		</Suspense>
	);
}
