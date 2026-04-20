import CodeSnippet from "./components/code-snippet";
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
			<CodeSnippet />
			<HowItWorks />
			<UseCaseGrid />
			<OpenSource />
			<CTA />
			<Faq />
		</div>
	);
}
