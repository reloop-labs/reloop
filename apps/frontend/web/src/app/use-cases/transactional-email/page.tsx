import { SplitScreenLayout } from "@reloop/web/components/landing/use-cases/layouts";
import TransactionalWidget from "@reloop/web/components/landing/use-cases/widgets/transactional";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/transactional-email";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function TransactionalEmailPage() {
	return (
		<SplitScreenLayout config={config}>
			<TransactionalWidget />
		</SplitScreenLayout>
	);
}
