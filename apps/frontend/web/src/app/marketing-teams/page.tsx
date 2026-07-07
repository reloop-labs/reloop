import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Bento from "./components/bento";
import CTA from "./components/cta";
import Guide from "./components/guide";
import Hero from "./components/hero";
import Metrics from "./components/metrics";
import Sandbox from "./components/sandbox";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/marketing-teams";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Email Marketing for Teams | Reloop",
	description:
		"Collaborative email campaign workspace for marketing teams. Create, review, and send campaigns together with role-based access, approval workflows, and shared templates.",
	keywords: [
		"email marketing platform",
		"team email campaigns",
		"collaborative email tool",
		"marketing team email",
		"campaign management",
		"email marketing workspace",
		"open source email marketing",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email Marketing for Teams | Reloop",
		description:
			"Collaborative email campaign workspace for marketing teams with role-based access and shared templates.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email Marketing for Teams | Reloop",
		description:
			"Collaborative email campaign workspace for marketing teams with role-based access and shared templates.",
	},
};

const MarketingTeamsPage = () => {
	return (
		<div>
			<Hero />
			<Sandbox />
			<Bento />
			<Metrics />
			<Guide />
			<CTA />
		</div>
	);
};

export default MarketingTeamsPage;
