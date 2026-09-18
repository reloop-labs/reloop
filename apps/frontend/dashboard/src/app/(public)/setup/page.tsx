import { Suspense } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { pageMetadata } from "../../_lib/page-metadata";
import { SetupPage } from "./client";

export const metadata = pageMetadata(
	"Setup | Reloop Dashboard",
	"Create the first administrator account for this self-hosted Reloop instance.",
);

export default function SetupRoute() {
	return (
		<Suspense fallback={<AuthSessionLoader />}>
			<SetupPage />
		</Suspense>
	);
}
