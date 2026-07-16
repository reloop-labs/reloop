import { TemplateList } from "#/features/templates/components/template-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/templates/")({
	component: TemplateList,
	head: () => ({
		meta: [
			{ title: "Templates · Reloop" },
			{
				name: "description",
				content: "Design and manage reusable email templates.",
			},
		],
	}),
});
