import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Bento from "./components/bento";
import CTA from "./components/cta";
import FAQ from "./components/faq";
import Guide from "./components/guide";
import Hero from "./components/hero";
import Metrics from "./components/metrics";
import Sandbox from "./components/sandbox";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/features/email-analytics";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Email Analytics & Deliverability Insights | Reloop",
	description:
		"Real-time email analytics, delivery observability, engagement heatmaps, and bounce diagnostics. Track opens, clicks, and domain reputation from the moment you hit send.",
	keywords: [
		"email analytics",
		"email deliverability insights",
		"email open rate tracking",
		"email click tracking",
		"bounce diagnostics",
		"SMTP error codes",
		"real-time email analytics",
		"email campaign metrics",
		"open source email analytics",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email Analytics & Deliverability Insights | Reloop",
		description:
			"Real-time email analytics, delivery observability, engagement heatmaps, and bounce diagnostics. Track opens, clicks, and domain reputation.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email Analytics & Deliverability Insights | Reloop",
		description:
			"Real-time email analytics, delivery observability, engagement heatmaps, and bounce diagnostics.",
	},
};

export default function EmailAnalyticsPage() {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:selection:bg-neutral-800 dark:bg-black dark:text-white">
			<Hero />
			<Sandbox />
			<Bento />
			<Metrics />
			<Guide />
			<FAQ />
			<CTA />
		</div>
	);
}
