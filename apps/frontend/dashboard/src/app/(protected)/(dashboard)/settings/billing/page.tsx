import { pageMetadata } from "#/app/_lib/page-metadata";
import { BillingPage } from "./client";

export const metadata = pageMetadata(
	"Billing · Reloop",
	"Manage your plan, upgrades, and invoices.",
);

export default function BillingRoute() {
	return <BillingPage />;
}
