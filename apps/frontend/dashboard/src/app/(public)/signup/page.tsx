import { Suspense } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { SignupPage } from "./client";

export default function SignupRoute() {
	return (
		<Suspense fallback={<AuthSessionLoader />}>
			<SignupPage />
		</Suspense>
	);
}
