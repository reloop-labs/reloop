import { GeneratorToolPage } from "@reloop/web/components/landing/tools/generator-tool-page";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import {
	faqGroups,
	faqs,
	metaDescription,
	metaTitle,
	toolDescription,
	toolKeywords,
	toolPath,
	toolTitle,
} from "./content";
import { GeneratorPanel } from "./generator-panel";

export const instant = false;

export const metadata = createPageMetadata({
	title: metaTitle,
	description: metaDescription,
	path: toolPath,
	keywords: toolKeywords,
	ogImage: false,
});

export default function DmarcGeneratorPage() {
	return (
		<GeneratorToolPage
			title={toolTitle}
			description={toolDescription}
			path={toolPath}
			panel={<GeneratorPanel />}
			faqGroups={faqGroups}
			faqs={faqs}
			apiPath="/api/tools/v1/dmarc-generate"
			apiBody='{"domain":"example.com","policy":"none","rua":"dmarc@example.com"}'
			apiLead="Generate DMARC from curl."
		/>
	);
}
