import { TemplateEditorLayoutClient } from "./layout-client";

export default function TemplateEditorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <TemplateEditorLayoutClient>{children}</TemplateEditorLayoutClient>;
}
