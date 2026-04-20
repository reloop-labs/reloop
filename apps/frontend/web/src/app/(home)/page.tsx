import CodeSnippet from "./components/code-snippet";
import CTA from "./components/cta";
import Faq from "./components/faq";
import Features from "./components/features";
import Hero from "./components/hero";
import OpenSource from "./components/open-source";
import UseCase from "./components/use-case";

export default function Home() {
	return (
		<div>
			<Hero />
			<Features />
			<CodeSnippet />
			<UseCase />
			<OpenSource />
			<CTA />
			<Faq />
		</div>
	);
}
