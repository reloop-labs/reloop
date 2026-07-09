"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Tag, User, Zap } from "lucide-react";
import type { InboxView } from "../types";
import { INBOX_VIEWS } from "../types";

const VIEW_ICONS = {
	zap: Zap,
	"alert-triangle": AlertTriangle,
	user: User,
	tag: Tag,
} as const;

const ACTIVE_STYLES = {
	primary: {
		btn: "bg-[#006ffe] text-white shadow-sm",
		icon: "fill-white text-white",
	},
	alerts: {
		btn: "bg-red-500 text-white shadow-sm dark:bg-red-600",
		icon: "text-white",
	},
	person: {
		btn: "bg-emerald-600 text-white shadow-sm dark:bg-emerald-700",
		icon: "text-white",
	},
	tag: {
		btn: "bg-purple-600 text-white shadow-sm dark:bg-purple-700",
		icon: "text-white",
	},
} as const;

const layoutSpring = {
	type: "spring" as const,
	stiffness: 500,
	damping: 36,
	mass: 0.6,
};

interface InboxCategoryNavbarProps {
	activeView: InboxView;
	onViewChange: (view: InboxView) => void;
	className?: string;
}

export function InboxCategoryNavbar({
	activeView,
	onViewChange,
	className,
}: InboxCategoryNavbarProps) {
	return (
		<nav
			className={cn("flex w-full items-center gap-2", className)}
			aria-label="Inbox categories"
		>
			{INBOX_VIEWS.map((view) => {
				const Icon = VIEW_ICONS[view.icon];
				const isActive = activeView === view.id;
				const styles = ACTIVE_STYLES[view.id];

				return (
					<motion.button
						layout
						key={view.id}
						type="button"
						onClick={() => onViewChange(view.id)}
						className={cn(
							"inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-xl font-medium text-sm focus:outline-none",
							isActive
								? cn("min-w-0 flex-1 px-3.5", styles.btn)
								: "w-9 shrink-0 bg-[var(--inbox-control)] text-mail-muted hover:bg-[var(--inbox-control-hover)] hover:text-mail-foreground",
						)}
						aria-pressed={isActive}
						aria-label={isActive ? undefined : view.label}
						title={isActive ? undefined : view.label}
						transition={layoutSpring}
					>
						{/* layout="position" prevents Framer from scaling/stretching the icon */}
						<motion.span
							layout="position"
							className="flex h-4 w-4 shrink-0 items-center justify-center"
						>
							<Icon
								className={cn(
									"h-4 w-4",
									isActive ? styles.icon : "text-mail-muted",
								)}
								aria-hidden
							/>
						</motion.span>
						<AnimatePresence initial={false}>
							{isActive ? (
								<motion.span
									key="label"
									initial={{ opacity: 0, x: -6 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -6 }}
									transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
									className="truncate font-semibold"
								>
									{view.label}
								</motion.span>
							) : null}
						</AnimatePresence>
					</motion.button>
				);
			})}
		</nav>
	);
}
