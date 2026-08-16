import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { InboxView } from "../../types";
import { INBOX_VIEWS } from "../../types";

interface InboxCategoryNavbarProps {
	activeView: InboxView;
	onViewChange: (view: InboxView) => void;
	counts?: Partial<Record<InboxView, number>>;
	className?: string;
}

export function InboxCategoryNavbar({
	activeView,
	onViewChange,
	counts,
	className,
}: InboxCategoryNavbarProps) {
	return (
		<nav
			className={cn(
				"flex w-full items-stretch overflow-x-auto border-mail-border/50 border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				className,
			)}
			aria-label="Inbox views"
		>
			{INBOX_VIEWS.map((view) => {
				const isActive = activeView === view.id;
				const count = counts?.[view.id] ?? 0;
				const showCount = view.id !== "all" && count > 0;

				return (
					<button
						key={view.id}
						type="button"
						onClick={() => onViewChange(view.id)}
						className={cn(
							"relative flex h-10 shrink-0 items-center gap-2 px-3.5 font-medium text-[13px] transition-colors",
							isActive
								? "text-mail-foreground"
								: "text-mail-muted hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground",
						)}
						aria-current={isActive ? "page" : undefined}
					>
						<Icon
							name={view.icon}
							className={cn(
								"h-3.5 w-3.5 shrink-0",
								isActive ? "text-zero-blue" : "opacity-70",
							)}
							aria-hidden
						/>
						<span>{view.label}</span>
						{showCount ? (
							<span
								className={cn(
									"tabular-nums text-[12px]",
									isActive ? "text-zero-blue" : "text-mail-muted",
								)}
							>
								{count > 99 ? "99+" : count}
							</span>
						) : null}
						{isActive ? (
							<span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-zero-blue" />
						) : null}
					</button>
				);
			})}
		</nav>
	);
}
