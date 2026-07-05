import CTA from "./components/cta";
import Faq from "./components/faq";
import Hero from "./components/hero";
import OpenSource from "./components/open-source";
import UseCase from "./components/use-case";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function Home() {
	return (
		<div>
			<Hero />
			<UseCase />
			<OpenSource />
			<CTA />
			<Faq />
		</div>
	);
}
