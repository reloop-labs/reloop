import { Suspense } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { DevicePage } from "./client";

export default function DeviceRoute() {
	return (
		<Suspense fallback={<AuthSessionLoader />}>
			<DevicePage />
		</Suspense>
	);
}
