import type { TemplateTabId } from "./preview-scenes";
import { PreviewStage } from "./preview-stage";

export function TemplatesPreview({
	activeTab,
	onTabChange,
}: {
	activeTab?: TemplateTabId;
	onTabChange?: (id: TemplateTabId) => void;
} = {}) {
	return <PreviewStage activeTab={activeTab} onTabChange={onTabChange} />;
}
