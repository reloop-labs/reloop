import { TemplateGeneratorPageView } from "@reloop/web/components/landing/tools/template-generator-page";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/tools/template-generator";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function TemplateGeneratorToolPage() {
	return <TemplateGeneratorPageView />;
}
