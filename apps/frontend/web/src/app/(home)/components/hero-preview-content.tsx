"use client";

import { HeroAnalyticsPreview } from "./hero-analytics-preview";
import { HeroAgentsPreview } from "./hero-agents-preview";
import { HeroCloudPreview } from "./hero-cloud-preview";
import { HeroDomainPreview } from "./hero-domain-preview";
import { HeroEmailsPreview } from "./hero-emails-preview";
import { HeroTemplatesPreview } from "./hero-templates-preview";
import { HeroWorkflowPreview } from "./hero-workflow-preview";

export type HeroTabId =
	| "overview"
	| "analytics"
	| "domain"
	| "workflow"
	| "templates"
	| "dashboard"
	| "sdk"
	| "cloud"
	| "agents";

export function HeroPreviewContent({ tab }: { tab: HeroTabId }) {
	switch (tab) {
		case "overview":
		case "dashboard":
			return <HeroEmailsPreview />;
		case "analytics":
			return <HeroAnalyticsPreview />;
		case "domain":
		case "sdk":
			return <HeroDomainPreview />;
		case "workflow":
			return <HeroWorkflowPreview />;
		case "templates":
			return <HeroTemplatesPreview />;
		case "cloud":
			return <HeroCloudPreview />;
		case "agents":
		default:
			return <HeroAgentsPreview />;
	}
}
