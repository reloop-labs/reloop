import { ReceivedEmailList } from "#/features/emails/components/received-email-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/emails/received")({
	component: ReceivedEmailList,
	head: () => ({
		meta: [
			{ title: "Received Emails · Reloop" },
			{
				name: "description",
				content:
					"View and filter inbound emails received by your workspace mailboxes.",
			},
		],
	}),
});
