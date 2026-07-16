import { createFileRoute } from "@tanstack/react-router";
import { DomainPage } from "#/features/domain/page";

export const Route = createFileRoute("/_dashboard/domain/")({
	component: DomainPage,
	head: () => ({
		meta: [
			{ title: "Domains · Reloop" },
			{
				name: "description",
				content: "Manage sending domains and DNS configuration.",
			},
		],
	}),
});
