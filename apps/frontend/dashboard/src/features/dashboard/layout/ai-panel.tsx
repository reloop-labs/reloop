/**
 * Side panel for live Support chat.
 *
 * Ask AI UI is intentionally hidden until API integration lands.
 * Expandable panel width is no longer supported — fixed width only.
 * Close control lives in SupportChatPanel header (with refresh).
 */

import { motion } from "framer-motion";
import { SupportChatPanel } from "#/features/dashboard/layout/support-chat-panel";

const PANEL_WIDTH = 400;

export const AiPanel = () => {
	return (
		<motion.aside
			initial={{ width: 0, opacity: 0 }}
			animate={{
				width: PANEL_WIDTH,
				opacity: 1,
			}}
			exit={{ width: 0, opacity: 0 }}
			transition={{ type: "spring", stiffness: 350, damping: 35 }}
			className="relative flex h-full flex-col overflow-hidden border-stroke-soft-100 border-l bg-white/50 backdrop-blur-md dark:border-white/5 dark:bg-[#0c0c0c]/80"
		>
			<div className="flex h-full w-[400px] flex-col overflow-hidden bg-white dark:bg-[#0c0c0c]">
				<SupportChatPanel />
			</div>
		</motion.aside>
	);
};
