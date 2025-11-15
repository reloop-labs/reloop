import Company from "./components/company";
import CTA from "./components/cta";
import Faq from "./components/faq";
import Hero from "./components/hero";
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
			<Scale />
			<Security />
			<Company />
			<CTA />
			<Faq />
		</div>
	);
}
