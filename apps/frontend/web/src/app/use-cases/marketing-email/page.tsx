import { CenteredVisualLayout } from "@reloop/web/components/landing/use-cases/layouts";
import MarketingWidget from "@reloop/web/components/landing/use-cases/widgets/marketing";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/marketing-email";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function MarketingEmailPage() {
	return (
		<CenteredVisualLayout config={config}>
			<MarketingWidget />
		</CenteredVisualLayout>
	);
}
