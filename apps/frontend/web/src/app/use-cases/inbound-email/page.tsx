import { ConsoleFirstLayout } from "@reloop/web/components/landing/use-cases/layouts";
import InboundWidget from "@reloop/web/components/landing/use-cases/widgets/inbound";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/inbound-email";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function InboundEmailPage() {
	return (
		<ConsoleFirstLayout config={config}>
			<InboundWidget />
		</ConsoleFirstLayout>
	);
}
