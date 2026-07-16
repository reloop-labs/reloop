import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "#/features/settings/profile/profile-page";

export const Route = createFileRoute("/_dashboard/settings/profile")({
	component: ProfilePage,
	head: () => ({
		meta: [
			{ title: "Profile · Reloop" },
			{
				name: "description",
				content: "Manage your personal profile details.",
			},
		],
	}),
});
