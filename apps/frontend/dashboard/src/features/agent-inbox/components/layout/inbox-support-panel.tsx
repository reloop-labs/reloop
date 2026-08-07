"use client";

import { AnimatePresence } from "framer-motion";
import { AiPanel } from "#/features/dashboard/layout/ai-panel";
import { useUIStore } from "#/store/use-ui-store";

/** Mounts the dashboard support chat panel when opened from the inbox top bar. */
export function InboxSupportPanel() {
	const isAiPanelOpen = useUIStore((s) => s.isAiPanelOpen);

	return (
		<AnimatePresence>{isAiPanelOpen ? <AiPanel /> : null}</AnimatePresence>
	);
}
