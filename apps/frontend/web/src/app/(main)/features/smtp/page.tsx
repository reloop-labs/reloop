import type { Metadata } from "next";
import Connection from "./components/connection";
import CTA from "./components/cta";
import Guide from "./components/guide";
import Hero from "./components/hero";
import Sandbox from "./components/sandbox";
import WorksWith from "./components/works-with";

export const metadata: Metadata = {
	title: "SMTP Relay | Reloop",
	description:
		"Send email through Reloop's SMTP relay. Plain-language guide, connection settings, and examples for Nodemailer, Laravel, and more.",
	openGraph: {
		title: "SMTP Relay | Reloop",
		description:
			"Send email through Reloop's SMTP relay. Connection settings and examples for common mailers.",
		type: "website",
	},
};

const SmtpPage = () => {
	return (
		<div>
			<Hero />
			<Connection />
			<WorksWith />
			<Sandbox />
			<Guide />
			<CTA />
		</div>
	);
};

export default SmtpPage;
