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

export default function SpfGeneratorPage() {
	return (
		<GeneratorToolPage
			title={toolTitle}
			description={toolDescription}
			path={toolPath}
			panel={<GeneratorPanel />}
			faqGroups={faqGroups}
			faqs={faqs}
			apiPath="/api/tools/v1/spf-generate"
			apiBody='{"domain":"example.com","includes":["spf.reloop.sh"],"mx":true,"policy":"~all"}'
			apiLead="Generate SPF from curl."
		/>
	);
}
