"use client";

import { HeroDashboardShell } from "./hero-dashboard-shell";
import {
	HeroPreviewContent,
	type HeroTabId,
} from "./hero-preview-content";

export { HeroPreviewContent, type HeroTabId };

export function HeroPreview({ tab }: { tab: HeroTabId }) {
	const activeNav =
		tab === "overview" || tab === "dashboard"
			? "emails"
			: tab === "analytics"
				? "metrics"
				: tab === "domain" || tab === "sdk" || tab === "cloud"
					? "domain"
					: tab === "workflow"
						? "workflow"
						: tab === "templates"
							? "templates"
							: "inbox";

	return (
		<div className="flex h-full flex-col" aria-hidden>
			<HeroDashboardShell activeItem={activeNav}>
				<HeroPreviewContent tab={tab} />
			</HeroDashboardShell>
		</div>
	);
}
