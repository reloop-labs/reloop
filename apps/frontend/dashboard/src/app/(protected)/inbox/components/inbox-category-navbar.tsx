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
			className={cn("flex items-center gap-2", className)}
			aria-label="Inbox categories"
		>
			{INBOX_VIEWS.map((view) => {
				const Icon = VIEW_ICONS[view.icon];
				const isPrimary = view.id === "primary";
				const isActive = activeView === view.id;

				if (isPrimary) {
					return (
						<button
							key={view.id}
							type="button"
							onClick={() => onViewChange(view.id)}
							className={cn(
								"inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 font-medium text-sm transition-colors",
								isActive
									? "bg-blue-500 text-white shadow-sm"
									: "bg-[var(--inbox-control)] text-mail-muted hover:bg-[var(--inbox-control-hover)] hover:text-mail-foreground",
							)}
							aria-pressed={isActive}
						>
							<Zap
								className={cn(
									"h-3.5 w-3.5",
									isActive ? "fill-white text-white" : "text-mail-muted",
								)}
							/>
							{view.label}
						</button>
					);
				}

				return (
					<button
						key={view.id}
						type="button"
						title={view.label}
						onClick={() => onViewChange(view.id)}
						className={cn(
							"inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
							isActive
								? "bg-blue-500/15 text-blue-500"
								: "bg-[var(--inbox-control)] text-mail-muted hover:bg-[var(--inbox-control-hover)] hover:text-mail-foreground",
						)}
						aria-label={view.label}
						aria-pressed={isActive}
					>
						<Icon className="h-4 w-4" />
					</button>
				);
			})}
		</nav>
	);
}
