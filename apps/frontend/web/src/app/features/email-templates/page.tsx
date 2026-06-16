import type { Metadata } from "next";
import Bento from "./components/bento";
import CTA from "./components/cta";
import Guide from "./components/guide";
import Hero from "./components/hero";
import Metrics from "./components/metrics";
import Sandbox from "./components/sandbox";

export const metadata: Metadata = {
	title: "Email Templates | Reloop",
	description:
		"Beautiful, responsive email templates for every use case. Choose from our library of pre-built templates or create custom designs with our drag-and-drop editor.",
	openGraph: {
		title: "Email Templates | Reloop",
		description:
			"Beautiful, responsive email templates for every use case. Choose from our library of pre-built templates or create custom designs with our drag-and-drop editor.",
		type: "website",
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
