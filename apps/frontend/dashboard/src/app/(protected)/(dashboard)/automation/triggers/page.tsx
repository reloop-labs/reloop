import { pageMetadata } from "#/app/_lib/page-metadata";
import { EventsPage } from "./client";

export const instant = false;

export const metadata = pageMetadata(
	"Triggers · Reloop",
	"Custom triggers that start automation workflows.",
);

export default function AutomationTriggersRoute() {
	return <EventsPage />;
}
