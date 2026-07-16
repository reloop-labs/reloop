import { createFileRoute } from "@tanstack/react-router";
import { ThemePage } from "#/features/settings/theme/theme-page";

export const Route = createFileRoute("/_dashboard/settings/theme")({
	component: ThemePage,
	head: () => ({
		meta: [
			{ title: "Theme · Reloop" },
			{
				name: "description",
				content:
					"Customize your dashboard appearance with light, dark, or system theme.",
			},
		],
	}),
});
