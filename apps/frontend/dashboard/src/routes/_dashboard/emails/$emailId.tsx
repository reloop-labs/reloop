import { EmailDetailPage } from "#/features/emails/detail/email-detail-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/emails/$emailId")({
	component: EmailDetailRoute,
	head: () => ({
		meta: [
			{ title: "Email Detail · Reloop" },
			{ name: "description", content: "View email delivery details." },
		],
	}),
});

function EmailDetailRoute() {
	const { emailId } = Route.useParams();
	return <EmailDetailPage emailId={emailId} />;
}
