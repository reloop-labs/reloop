import Bento from "./components/bento";
import CTA from "./components/cta";
import Guide from "./components/guide";
import Hero from "./components/hero";
import Metrics from "./components/metrics";
import Sandbox from "./components/sandbox";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "SMTP Relay | Reloop",
	description:
		"High-performance managed SMTP relay for developers. TLS, authentication, global edge network, and delivery webhooks—connect in minutes.",
	openGraph: {
		title: "SMTP Relay | Reloop",
		description:
			"High-performance managed SMTP relay for developers. TLS, authentication, global edge network, and delivery webhooks—connect in minutes.",
		type: "website",
	},
};

const SmtpPage = () => {
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

export default SmtpPage;
