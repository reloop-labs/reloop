import { AutomationFlowLayout } from "@reloop/web/components/landing/use-cases/layouts";
import AutomatedWidget from "@reloop/web/components/landing/use-cases/widgets/automated";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/automated-email";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function AutomatedEmailPage() {
	return (
		<AutomationFlowLayout config={config}>
			<AutomatedWidget />
		</AutomationFlowLayout>
	);
}
