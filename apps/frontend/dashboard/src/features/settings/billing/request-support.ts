import { useUIStore } from "#/store/use-ui-store";

/**
 * Open the Support panel with a pre-filled message (auto-sent when chat is ready).
 * Matches Next billing CTAs that queue a support message.
 */
export function requestPlanSupport(message: string) {
	const { setPendingSupportMessage, setAiPanelActiveTab, setIsAiPanelOpen } =
		useUIStore.getState();
	setPendingSupportMessage(message);
	setAiPanelActiveTab("support");
	setIsAiPanelOpen(true);
}
