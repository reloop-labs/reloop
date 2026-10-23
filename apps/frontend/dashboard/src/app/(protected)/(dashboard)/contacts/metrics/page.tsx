import { pageMetadata } from "#/app/_lib/page-metadata";
import { ContactMetricsPage } from "./client";

export const metadata = pageMetadata(
	"Audience metrics · Reloop",
	"Subscriber growth, unsubscribes and activity spikes.",
);

export default function ContactMetricsRoute() {
	return <ContactMetricsPage />;
}
