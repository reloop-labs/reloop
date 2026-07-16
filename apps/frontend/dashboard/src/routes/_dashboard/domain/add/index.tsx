import { createFileRoute } from "@tanstack/react-router";
import { AddDomainPage } from "#/features/domain/add/page";

export const Route = createFileRoute("/_dashboard/domain/add/")({
	component: AddDomainPage,
	head: () => ({
		meta: [
			{ title: "Add Domain · Reloop" },
			{
				name: "description",
				content: "Add a custom domain for sending email.",
			},
		],
	}),
});
