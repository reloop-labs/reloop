import { Suspense } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { LoginPage } from "./client";

export default function LoginRoute() {
	return (
		<Suspense fallback={<AuthSessionLoader />}>
			<LoginPage />
		</Suspense>
	);
}
