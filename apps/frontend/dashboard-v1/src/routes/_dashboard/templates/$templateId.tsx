import { TemplateDetailPage } from "#/features/templates/detail/template-detail-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/templates/$templateId")({
	component: TemplateDetailRoute,
	head: () => ({
		meta: [
			{ title: "Template · Reloop" },
			{
				name: "description",
				content: "View and manage an email template.",
			},
		],
	}),
});

function TemplateDetailRoute() {
	const { templateId } = Route.useParams();
	return <TemplateDetailPage templateId={templateId} />;
}
