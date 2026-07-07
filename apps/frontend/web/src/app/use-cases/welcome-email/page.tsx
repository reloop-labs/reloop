import { CenteredVisualLayout } from "@reloop/web/components/landing/use-cases/layouts";
import WelcomeWidget from "@reloop/web/components/landing/use-cases/widgets/welcome";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/welcome-email";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function WelcomeEmailPage() {
	return (
		<CenteredVisualLayout config={config}>
			<WelcomeWidget />
		</CenteredVisualLayout>
	);
}
