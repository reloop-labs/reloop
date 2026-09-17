import { JsonLd } from "@reloop/web/components/json-ld";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import ReloopEngine from "./reloop-engine";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/engine";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata = createPageMetadata({
	title: "Reloop Engine",
	description:
		"How Reloop is built: five layers from wire protocols and the KumoMTA sending core to deliverability tooling, the REST API, and autonomous agent surfaces.",
	path: pagePath,
	keywords: [
		"Reloop engine",
		"email architecture",
		"SMTP pipeline",
		"email infrastructure stack",
		"open source email engine",
	],
});

const jsonLd = {
	"@context": "https://schema.org" as const,
	"@type": "WebPage" as const,
	url: pageUrl,
	name: "Reloop Engine",
	description:
		"How Reloop is built: five layers from wire protocols and the KumoMTA sending core to deliverability tooling, the REST API, and autonomous agent surfaces.",
};

export default function EnginePage() {
	return (
		<>
			<JsonLd data={jsonLd} />
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<ReloopEngine />
			</div>
		</>
	);
}
