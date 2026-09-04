import { pageMetadata } from "#/app/_lib/page-metadata";
import { EventsPage } from "./client";

export const instant = false;

export const metadata = pageMetadata(
	"Events · Reloop",
	"Custom events that start automation workflows.",
);

export default function AutomationEventsRoute() {
	return <EventsPage />;
}
