import { Suspense } from "react";
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
	return (
		<Suspense fallback={null}>
			<TemplateEditorPage templateId={templateId} />
		</Suspense>
	);
}
