import { TemplateEditorPage } from "#/features/templates/editor/template-editor-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/templates/$templateId")({
	component: TemplateEditorRoute,
	head: () => ({
		meta: [
			{ title: "Template Editor · Reloop" },
			{
				name: "description",
				content: "Design and edit an email template.",
			},
		],
	}),
});

function TemplateEditorRoute() {
	const { templateId } = Route.useParams();
	return <TemplateEditorPage templateId={templateId} />;
}
