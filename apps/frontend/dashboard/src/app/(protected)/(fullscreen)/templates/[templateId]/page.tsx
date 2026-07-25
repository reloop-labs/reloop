import { pageMetadata } from "#/app/_lib/page-metadata";
import { TemplateEditorPage } from "./client";

export const metadata = pageMetadata(
	"Template Editor · Reloop",
	"Design and edit an email template.",
);

export default async function TemplateEditorRoute({
	params,
}: {
	params: Promise<{ templateId: string }>;
}) {
	const { templateId } = await params;
	return <TemplateEditorPage templateId={templateId} />;
}
