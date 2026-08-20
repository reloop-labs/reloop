import type { PreviewTabId } from "./preview-scenes";
import { PreviewStage } from "./preview-stage";

export function TransactionalEmailPreview({
	activeTab,
	onTabChange,
}: {
	activeTab?: PreviewTabId;
	onTabChange?: (id: PreviewTabId) => void;
} = {}) {
	return <PreviewStage activeTab={activeTab} onTabChange={onTabChange} />;
}
