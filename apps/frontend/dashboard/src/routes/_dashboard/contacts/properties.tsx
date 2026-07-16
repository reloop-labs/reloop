import { createFileRoute } from "@tanstack/react-router";
import { PropertyList } from "#/features/contacts/components/properties/property-list";

export const Route = createFileRoute("/_dashboard/contacts/properties")({
	component: PropertyList,
	head: () => ({
		meta: [
			{ title: "Properties · Reloop" },
			{
				name: "description",
				content: "Custom contact properties for your audience.",
			},
		],
	}),
});
