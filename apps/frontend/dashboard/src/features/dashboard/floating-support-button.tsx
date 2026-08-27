"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Headset } from "lucide-react";
import { useSupportUnread } from "#/features/dashboard/hooks/use-support-unread";
import { useUIStore } from "#/store/use-ui-store";

export function FloatingSupportButton() {
	const {
		isAiPanelOpen,
		setIsAiPanelOpen,
		aiPanelActiveTab,
		setAiPanelActiveTab,
	} = useUIStore();
	const { unreadCount } = useSupportUnread();

	const handleClick = () => {
		if (!isAiPanelOpen) {
			setAiPanelActiveTab("support");
			setIsAiPanelOpen(true);
		} else if (aiPanelActiveTab === "support") {
			setIsAiPanelOpen(false);
		} else {
			setAiPanelActiveTab("support");
			setIsAiPanelOpen(true);
		}
	};

	return (
		<AnimatePresence>
			{!isAiPanelOpen ? (
				<motion.button
					key="floating-support-btn"
					type="button"
					onClick={handleClick}
					initial={{ scale: 0.85, opacity: 0, y: 12 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.85, opacity: 0, y: 12 }}
					whileTap={{ scale: 0.97 }}
					transition={{ type: "spring", stiffness: 400, damping: 28 }}
					title="Open Support"
					aria-label="Open human customer support chat"
					className="fixed right-5 bottom-5 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-stroke-soft-100 bg-bg-white-0/95 px-3.5 py-2 font-medium text-text-strong-950 text-xs backdrop-blur-sm dark:border-stroke-soft-100/50 dark:bg-[#141416]/95 dark:text-white"
				>
					<span className="relative flex items-center justify-center">
						<Headset className="h-4 w-4 text-text-sub-600 dark:text-white/80" />
					</span>
					<span>Support</span>
					{unreadCount > 0 ? (
						<span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 font-semibold text-[10px] text-white tabular-nums">
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					) : null}
				</motion.button>
			) : null}
		</AnimatePresence>
	);
}
