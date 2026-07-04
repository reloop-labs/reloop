import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Bento from "./components/bento";
import CTA from "./components/cta";
import Guide from "./components/guide";
import Hero from "./components/hero";
import Metrics from "./components/metrics";
import Sandbox from "./components/sandbox";

const pageUrl = `${getSiteUrl()}/features/email-templates`;

export const metadata: Metadata = {
	title: "Email Templates | Reloop",
	description:
		"Beautiful, responsive email templates for every use case. Choose from our library of pre-built templates or create custom designs with our drag-and-drop editor.",
	keywords: [
		"email templates",
		"responsive email templates",
		"email template builder",
		"drag and drop email editor",
		"HTML email templates",
		"open source email templates",
		"email design",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email Templates | Reloop",
		description:
			"Beautiful, responsive email templates for every use case. Choose from our library of pre-built templates or create custom designs with our drag-and-drop editor.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email Templates | Reloop",
		description:
			"Beautiful, responsive email templates. Pre-built library or custom designs with drag-and-drop editor.",
	},
};

const EmailTemplatesPage = () => {
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

export default EmailTemplatesPage;
