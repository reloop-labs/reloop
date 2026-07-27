import { Suspense } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { InvitePage } from "./client";

export default function InviteRoute() {
	return (
		<Suspense fallback={<AuthSessionLoader />}>
			<InvitePage />
		</Suspense>
	);
}
