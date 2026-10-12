import { createPageMetadata } from "@reloop/web/lib/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toolPath, toolTitle } from "../content";
import { editorTemplateExamples, getEmailTemplateExample } from "../templates";
import { TemplateEditor } from "./template-editor";

type PageProps = {
	params: Promise<{ templateId: string }>;
};

export function generateStaticParams() {
	return editorTemplateExamples.map((template) => ({
		templateId: template.id,
	}));
}

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { templateId } = await params;
	const template = getEmailTemplateExample(templateId);
	if (!template) return { title: "Template not found" };

	return createPageMetadata({
		title: `${template.name} email template | ${toolTitle}`,
		description: template.description,
		path: `${toolPath}/${template.id}`,
		ogImage: `${toolPath}/opengraph-image`,
	});
}

export default async function EmailTemplateEditorPage({ params }: PageProps) {
	const { templateId } = await params;
	if (!getEmailTemplateExample(templateId)) notFound();

	return <TemplateEditor templateId={templateId} />;
}
