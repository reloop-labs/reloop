import CTA from "./components/cta";
import Faq from "./components/faq";
import Hero from "./components/hero";
import { Scale } from "./components/scale";
import Security from "./components/security";

export default function Home() {
	return (
		<div>
			<Hero />
			<Scale />
			<Security />
			<CTA />
			<Faq />
		</div>
	);
}
