import CTA from "./components/cta";
import Faq from "./components/faq";
import Hero from "./components/hero";
import HowItWorks from "./components/how-it-works";
import OpenSource from "./components/open-source";
import UseCaseGrid from "./components/use-case-grid";

export default function Home() {
	return (
		<div>
			<Hero />
			<HowItWorks />
			<CTA />
			<OpenSource />
			<UseCaseGrid />
			<Faq />
		</div>
	);
}
