import { ToolLandingPage } from "@reloop/web/components/landing/tool-landing-page";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/tools/subject-tester";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function SubjectTesterToolPage() {
	return <ToolLandingPage config={config} />;
}
