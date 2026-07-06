import type { PageAccent } from "../page-accents";

export type PersonaEnrichment = {
	accent: PageAccent;
	headline: string;
	painPoints: string[];
	wins: string[];
};

export const personaEnrichment: Record<string, PersonaEnrichment> = {
	developers: {
		accent: "slate",
		headline: "Email APIs that feel like the rest of your stack",
		painPoints: ["Opaque black-box ESPs", "Missing webhooks & logs", "No self-host option"],
		wins: ["Type-safe SDKs", "Real-time delivery logs", "Open-source codebase"],
	},
	startups: {
		accent: "emerald",
		headline: "Ship email on day one without enterprise contracts",
		painPoints: ["Expensive tiers too early", "Separate tools for marketing", "Vendor lock-in"],
		wins: ["Free tier to start", "Transactional + campaigns", "Self-host when you scale"],
	},
	saas: {
		accent: "blue",
		headline: "Lifecycle email built into your product",
		painPoints: ["Auth emails off-brand", "Billing receipts manual", "Churn on failed renewals"],
		wins: ["Stripe webhook recipes", "Onboarding sequences", "Product analytics"],
	},
	agencies: {
		accent: "rose",
		headline: "Manage client sending domains in one place",
		painPoints: ["Per-client ESP accounts", "Deliverability fire drills", "Reporting scattered"],
		wins: ["Multi-domain dashboard", "Template libraries", "Per-domain analytics"],
	},
	enterprises: {
		accent: "indigo",
		headline: "Self-hosted email when compliance requires it",
		painPoints: ["Data residency rules", "Security review blockers", "Unpredictable SaaS costs"],
		wins: ["Deploy on your VPC", "Apache 2.0 audit", "Same product hosted or self-run"],
	},
	"open-source-projects": {
		accent: "cyan",
		headline: "Email infra that matches your open-source values",
		painPoints: ["Proprietary ESPs", "Newsletter tools with upsells", "No code transparency"],
		wins: ["Apache 2.0 license", "Community-friendly pricing", "Self-hostable"],
	},
};

export function getPersonaEnrichment(slug: string): PersonaEnrichment {
	return (
		personaEnrichment[slug] ?? {
			accent: "blue",
			headline: "Email built for your team",
			painPoints: ["Complex setup", "Poor deliverability"],
			wins: ["Fast integration", "Reliable delivery"],
		}
	);
}
