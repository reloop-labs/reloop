import { pageMetadata } from "#/app/_lib/page-metadata";
import { TemplateCreatePage } from "#/features/templates/create/template-create-page";

export const metadata = pageMetadata(
	"New Template · Reloop",
	"Create a new email template with AI.",
);

export default function NewTemplateRoute() {
	return <TemplateCreatePage />;
}
