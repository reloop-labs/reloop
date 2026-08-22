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
				"flex overflow-x-auto border-stroke-soft-100 border-y dark:border-stroke-soft-100/40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
							"group relative flex w-[160px] cursor-pointer items-center gap-2.5 border-stroke-soft-100 border-l px-4 py-3.5 text-left transition-colors first:border-l-0 sm:px-5 dark:border-stroke-soft-100/40",
							isActive
								? "bg-transparent"
								: "bg-transparent hover:bg-neutral-alpha-10",
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
									"h-4 w-4 shrink-0 transition-colors",
									isActive
										? "text-text-strong-950"
										: "text-text-sub-600 opacity-70 group-hover:text-text-strong-950 group-hover:opacity-100",
								)}
								aria-hidden
							/>
						</span>
						<span
							className={cn(
								"truncate font-medium text-[13px] tracking-[-0.01em] transition-colors sm:text-[14px]",
								isActive
									? "text-text-strong-950"
									: "text-text-sub-600 group-hover:text-text-strong-950",
							)}
						>
							{view.label}
						</span>
						{isActive ? (
							<span className="absolute inset-x-0 bottom-0 h-[2px] bg-text-strong-950" />
						) : null}
					</button>
				);
			})}
		</nav>
	);
}
