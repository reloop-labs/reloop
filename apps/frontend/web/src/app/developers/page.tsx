import { PersonaPageView } from "@reloop/web/components/landing/personas/persona-page-view";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/personas/developers";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function DevelopersPersonaPage() {
	return <PersonaPageView config={config} />;
}
