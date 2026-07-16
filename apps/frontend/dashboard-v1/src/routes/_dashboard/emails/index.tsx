import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/emails/")({
	beforeLoad: () => {
		throw redirect({ to: "/emails/sent" });
	},
});
