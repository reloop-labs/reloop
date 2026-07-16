import { createFileRoute } from "@tanstack/react-router";
import { SmtpPage } from "#/features/smtp/smtp-page";

export const Route = createFileRoute("/_dashboard/smtp")({
	component: SmtpPage,
	head: () => ({
		meta: [
			{ title: "SMTP Relay · Reloop" },
			{
				name: "description",
				content: "Send emails using SMTP relay with Reloop credentials.",
			},
		],
	}),
});
