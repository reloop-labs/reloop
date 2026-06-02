import Bento from "./components/bento";
import CTA from "./components/cta";
import Guide from "./components/guide";
import Hero from "./components/hero";
import Metrics from "./components/metrics";
import Sandbox from "./components/sandbox";

const MarketingTeamsPage = () => {
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

export default MarketingTeamsPage;
