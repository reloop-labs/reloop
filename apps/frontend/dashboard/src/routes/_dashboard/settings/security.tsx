import { createFileRoute } from "@tanstack/react-router";
import { SecurityPage } from "#/features/settings/security/security-page";

export const Route = createFileRoute("/_dashboard/settings/security")({
	component: SecurityPage,
	head: () => ({
		meta: [
			{ title: "Security · Reloop" },
			{
				name: "description",
				content:
					"Manage your account security, connected accounts, and active sessions.",
			},
		],
	}),
});
