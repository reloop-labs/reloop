import { DeliverabilityTesterPageView } from "@reloop/web/components/landing/tools/deliverability-tester-page";
import { config } from "@reloop/web/lib/landing/tools/deliverability-tester";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function DeliverabilityTesterPage() {
	return <DeliverabilityTesterPageView />;
}
