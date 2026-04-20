import Company from "./components/company";
import CTA from "./components/cta";
import Faq from "./components/faq";
import Hero from "./components/hero";
import HowItWorks from "./components/how-it-works";
import OpenSource from "./components/open-source";
import { Scale } from "./components/scale";
import Sdk from "./components/sdk";
import Security from "./components/security";
import UseCase from "./components/use-case";
export default function Home() {
	return (
		<div>
			<Hero />
			<Sdk />
			<UseCase />
			<HowItWorks />
			<Scale />
			<Security />
			<Company />
			<CTA />
			<OpenSource />
			<Faq />
		</div>
	);
}
