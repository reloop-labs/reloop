/**
 * Overlay Support chat. Fixed to the viewport so it never shifts the shell.
 * Below `md`: full-screen. `md+`: 400px drawer from the right.
 */

import { motion } from "framer-motion";
import { SupportChatPanel } from "#/features/dashboard/layout/support-chat-panel";
import { useUIStore } from "#/store/use-ui-store";

export const AiPanel = () => {
	const setIsAiPanelOpen = useUIStore((s) => s.setIsAiPanelOpen);

	return (
		<motion.div
			className="fixed inset-0 z-[70]"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
		>
			<button
				type="button"
				aria-label="Close support"
				className="absolute inset-0 bg-black/40"
				onClick={() => setIsAiPanelOpen(false)}
			/>
			<motion.aside
				initial={{ x: "100%" }}
				animate={{ x: 0 }}
				exit={{ x: "100%" }}
				transition={{ type: "spring", stiffness: 350, damping: 35 }}
				className="absolute inset-y-0 right-0 flex h-full w-full flex-col overflow-hidden border-stroke-soft-100 bg-white shadow-2xl md:w-[400px] md:border-l dark:border-white/5 dark:bg-[#0c0c0c]"
			>
				<div className="flex h-full w-full flex-col overflow-hidden">
					<SupportChatPanel />
				</div>
			</motion.aside>
		</motion.div>
	);
};
