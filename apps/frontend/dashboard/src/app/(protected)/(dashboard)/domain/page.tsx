import { pageMetadata } from "#/app/_lib/page-metadata";
import { DomainPage } from "./client";

export const metadata = pageMetadata(
	"Domains · Reloop",
	"Manage sending domains and DNS configuration.",
);

export default function DomainsRoute() {
	return <DomainPage />;
}
