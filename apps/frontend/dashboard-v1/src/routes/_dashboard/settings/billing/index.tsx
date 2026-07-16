import { createFileRoute } from "@tanstack/react-router";
import { BillingPage } from "#/features/settings/billing/billing-page";

export const Route = createFileRoute("/_dashboard/settings/billing/")({
	component: BillingPage,
	head: () => ({
		meta: [
			{ title: "Billing · Reloop" },
			{
				name: "description",
				content: "Manage your plan, upgrades, and invoices.",
			},
		],
	}),
});
