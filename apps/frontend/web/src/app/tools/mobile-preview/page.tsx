import { MobilePreviewPageView } from "@reloop/web/components/landing/tools/mobile-preview-page";
import { config } from "@reloop/web/lib/landing/tools/mobile-preview";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function MobilePreviewPage() {
	return <MobilePreviewPageView />;
}
