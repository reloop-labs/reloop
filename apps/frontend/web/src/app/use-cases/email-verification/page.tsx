import { SplitScreenLayout } from "@reloop/web/components/landing/use-cases/layouts";
import EmailVerificationWidget from "@reloop/web/components/landing/use-cases/widgets/email-verification";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/email-verification";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function EmailVerificationPage() {
	return (
		<SplitScreenLayout config={config}>
			<EmailVerificationWidget />
		</SplitScreenLayout>
	);
}
