import { EmailList } from "#/features/emails/components/email-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/emails/sent")({
	component: EmailList,
	head: () => ({
		meta: [
			{ title: "Sent Emails · Reloop" },
			{
				name: "description",
				content: "Track and monitor your sent outbound transactional emails.",
			},
		],
	}),
});
