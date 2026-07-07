import { SplitScreenLayout } from "@reloop/web/components/landing/use-cases/layouts";
import PasswordResetWidget from "@reloop/web/components/landing/use-cases/widgets/password-reset";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/password-reset-email";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function PasswordResetEmailPage() {
	return (
		<SplitScreenLayout config={config}>
			<PasswordResetWidget />
		</SplitScreenLayout>
	);
}
