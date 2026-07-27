import { pageMetadata } from "#/app/_lib/page-metadata";
import { UsagePage } from "./client";

export const metadata = pageMetadata(
	"Usage · Reloop",
	"Track your plan limits and resource usage for this billing period.",
);

export default function SettingsUsageRoute() {
	return <UsagePage />;
}
