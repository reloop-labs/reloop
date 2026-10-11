"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getEmailTemplateExample } from "../templates";

const EmailHtmlEditorPage = dynamic(
	() =>
		import("@reloop/web/lib/email-html-editor/email-html-editor-page").then(
			(mod) => mod.EmailHtmlEditorPage,
		),
	{ ssr: false },
);

export function TemplateEditor({ templateId }: { templateId: string }) {
	const template = getEmailTemplateExample(templateId);
	// Image URLs in the template must be absolute for the canvas and for
	// anyone copying the HTML out, so wait for the browser origin.
	const [origin, setOrigin] = useState<string | null>(null);

	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	if (!template || !origin) {
		return <div className="h-dvh bg-bg-white-0 dark:bg-black" />;
	}

	return (
		<EmailHtmlEditorPage
			html={template.html(origin)}
			variables={template.variables}
			templateName={template.name}
		/>
	);
}
