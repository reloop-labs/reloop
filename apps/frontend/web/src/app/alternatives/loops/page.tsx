import { AlternativePageView } from "@reloop/web/components/landing/alternatives/alternative-page-view";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/alternatives/loops";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function LoopsAlternativePage() {
	return <AlternativePageView config={config} />;
}
