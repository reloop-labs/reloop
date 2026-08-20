import type { MarketingTabId } from "./preview-scenes";
import { PreviewStage } from "./preview-stage";

export function MarketingEmailsPreview({
	activeTab,
	onTabChange,
}: {
	activeTab?: MarketingTabId;
	onTabChange?: (id: MarketingTabId) => void;
} = {}) {
	return (
		<div className="mt-10 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-black">
			<PreviewStage activeTab={activeTab} onTabChange={onTabChange} />
		</div>
	);
}
