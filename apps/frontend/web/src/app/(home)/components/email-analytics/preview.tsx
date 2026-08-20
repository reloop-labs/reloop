import type { AnalyticsTabId } from "./preview-scenes";
import { PreviewStage } from "./preview-stage";

export function EmailAnalyticsPreview({
	activeTab,
	onTabChange,
}: {
	activeTab?: AnalyticsTabId;
	onTabChange?: (id: AnalyticsTabId) => void;
} = {}) {
	return <PreviewStage activeTab={activeTab} onTabChange={onTabChange} />;
}
