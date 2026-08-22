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
	className,
}: InboxCategoryNavbarProps) {
	return (
		<nav
			className={cn(
				"flex overflow-x-auto border-mail-border/50 border-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				className,
			)}
			aria-label="Inbox views"
		>
			{INBOX_VIEWS.map((view) => {
				const isActive = activeView === view.id;

				return (
					<button
						key={view.id}
						type="button"
						onClick={() => onViewChange(view.id)}
						className={cn(
							"relative flex w-[160px] items-center gap-2.5 border-mail-border/50 border-l px-4 py-4 text-left first:border-l-0 sm:px-5",
							isActive
								? "bg-transparent"
								: "bg-transparent hover:bg-[var(--inbox-row-hover)]",
						)}
						aria-current={isActive ? "page" : undefined}
					>
						<span
							className={cn(
								"flex w-5 shrink-0 items-center justify-center",
								view.id === "all" && "ml-1",
							)}
						>
							<Icon
								name={view.icon}
								className={cn(
									"h-4 w-4 shrink-0",
									isActive ? "text-mail-foreground" : "text-mail-muted",
								)}
								aria-hidden
							/>
						</span>
						<span
							className={cn(
								"truncate font-medium text-[14px] tracking-[-0.01em] sm:text-[15px]",
								isActive ? "text-mail-foreground" : "text-mail-muted",
							)}
						>
							{view.label}
						</span>
						{isActive ? (
							<span className="absolute inset-x-0 bottom-0 h-[2px] bg-mail-foreground" />
						) : null}
					</button>
				);
			})}
		</nav>
	);
}
