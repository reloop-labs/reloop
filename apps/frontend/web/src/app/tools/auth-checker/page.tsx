import { AuthCheckerPageView } from "@reloop/web/components/landing/tools/auth-checker-page";
import { config } from "@reloop/web/lib/landing/tools/auth-checker";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function AuthCheckerPage() {
	return <AuthCheckerPageView />;
}
