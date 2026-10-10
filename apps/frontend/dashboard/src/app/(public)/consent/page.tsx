import { Suspense } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { ConsentPage } from "./client";

export default function ConsentRoute() {
	return (
		<Suspense fallback={<AuthSessionLoader />}>
			<ConsentPage />
		</Suspense>
	);
}
