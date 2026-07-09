"use client";

import { cn } from "@reloop/ui/cn";
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
					<button
						key={view.id}
						type="button"
						onClick={() => onViewChange(view.id)}
						className={cn(
							"inline-flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-xl font-medium text-sm focus:outline-none transition-all duration-300 ease-in-out",
							isActive
								? cn("min-w-0 flex-1 px-3.5 gap-1.5", styles.btn)
								: "w-9 shrink-0 gap-0 bg-[var(--inbox-control)] text-mail-muted hover:bg-[var(--inbox-control-hover)] hover:text-mail-foreground",
						)}
						aria-pressed={isActive}
						aria-label={isActive ? undefined : view.label}
						title={isActive ? undefined : view.label}
					>
						<span className="flex h-4 w-4 shrink-0 items-center justify-center">
							<Icon
								className={cn(
									"h-4 w-4 transition-colors duration-300",
									isActive ? styles.icon : "text-mail-muted",
								)}
								aria-hidden
							/>
						</span>
						<span
							className={cn(
								"truncate font-semibold transition-all duration-300 ease-in-out",
								isActive
									? "max-w-[100px] opacity-100 translate-x-0"
									: "max-w-0 opacity-0 -translate-x-2 pointer-events-none",
							)}
						>
							{view.label}
						</span>
					</button>
				);
			})}
		</nav>
	);
}

