"use client";

import AgentSection from "./features/agent-section";
import DeveloperSection from "./features/developer-section";
import MarketingSection from "./features/marketing-section";

export default function Features() {
	return (
		<div id="features" className="divide-y divide-[#0a0d12]/5 dark:divide-white/5">
			<AgentSection />
			<DeveloperSection />
			<MarketingSection />
		</div>
	);
}
