import { Suspense } from "react";
import { pageMetadata } from "#/app/_lib/page-metadata";
import { TemplateRoute } from "./client";

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
			<TemplateRoute param={decodeURIComponent(templateId)} />
		</Suspense>
	);
}
