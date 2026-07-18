import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import type { ReactNode } from "react";

const iconBtnBase = cn(
	"inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-lg",
	"transition-[transform,background-color,color] duration-150 ease-out",
	"active:scale-[0.97]",
);

type ActionTone =
	| "neutral"
	| "star"
	| "important"
	| "archive"
	| "spam"
	| "print"
	| "unsubscribe"
	| "danger";

const toneClass: Record<ActionTone, string> = {
	neutral:
		"bg-[var(--inbox-control)] text-mail-muted hover:bg-neutral-200/80 hover:text-mail-foreground dark:hover:bg-white/10",
	star: "bg-[var(--inbox-control)] text-mail-muted hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-500/15 dark:hover:text-amber-300",
	important:
		"bg-[var(--inbox-control)] text-mail-muted hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-500/15 dark:hover:text-orange-300",
	archive:
		"bg-[var(--inbox-control)] text-mail-muted hover:bg-sky-100 hover:text-sky-700 dark:hover:bg-sky-500/15 dark:hover:text-sky-300",
	spam: "bg-[var(--inbox-control)] text-mail-muted hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-500/15 dark:hover:text-rose-300",
	print:
		"bg-[var(--inbox-control)] text-mail-muted hover:bg-slate-200/90 hover:text-slate-700 dark:hover:bg-slate-500/20 dark:hover:text-slate-200",
	unsubscribe:
		"bg-[var(--inbox-control)] text-mail-muted hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-teal-500/15 dark:hover:text-teal-300",
	danger:
		"border border-[var(--inbox-danger-border)] bg-[var(--inbox-danger-bg)] text-[var(--inbox-danger-fg)] hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-500/20 dark:hover:text-red-300",
};

const ToolbarTooltip = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<Tooltip.Root>
		<Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
		<Tooltip.Content size="xsmall" side="bottom" sideOffset={6}>
			{label}
		</Tooltip.Content>
	</Tooltip.Root>
);

const ActionButton = ({
	label,
	onClick,
	tone = "neutral",
	className,
	children,
}: {
	label: string;
	onClick?: () => void;
	tone?: ActionTone;
	className?: string;
	children: ReactNode;
}) => (
	<ToolbarTooltip label={label}>
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className={cn(iconBtnBase, toneClass[tone], className)}
		>
			<span className="relative flex h-3.5 w-3.5 items-center justify-center text-current [&_svg]:h-3.5 [&_svg]:w-3.5">
				{children}
			</span>
		</button>
	</ToolbarTooltip>
);

export const ZeroThreadToolbar = ({
	isStarred,
	isImportant,
	folder,
	onClose,
	onToggleStar,
	onToggleImportant,
	onArchive,
	onUnarchive,
	onRestore,
	onDelete,
	onPrint,
	onMarkSpam,
	onUnsubscribe,
	showBack,
}: {
	isStarred: boolean;
	isImportant?: boolean;
	folder?: string;
	onClose?: () => void;
	onToggleStar: () => void;
	onToggleImportant?: () => void;
	onArchive: () => void;
	onUnarchive?: () => void;
	onRestore?: () => void;
	onDelete: () => void;
	onPrint: () => void;
	onMarkSpam: () => void;
	onUnsubscribe?: () => void;
	showBack?: boolean;
}) => {
	const inArchive = folder === "archive" || folder === "archived";
	const inTrash = folder === "trash";
	const inSpam = folder === "spam";
	const showRestore = inArchive || inTrash || inSpam;
	const starLabel = isStarred ? "Unstar" : "Star";
	const importantLabel = isImportant ? "Unmark important" : "Mark important";
	const trashLabel = inTrash ? "Delete forever" : "Move to trash";

	return (
		<Tooltip.Provider delayDuration={400} skipDelayDuration={0}>
			<div className="flex shrink-0 items-center px-1 pb-[10px] md:px-3 md:pt-3 md:pb-[11px]">
				<div className="flex flex-1 items-center gap-2">
					{(showBack || onClose) && (
						<ActionButton
							label="Close"
							onClick={onClose}
							tone="neutral"
							className={showBack ? "inline-flex" : "hidden md:inline-flex"}
						>
							<Icon name="cross" />
						</ActionButton>
					)}
				</div>

				<div className="flex items-center gap-1">
					<ActionButton
						label={starLabel}
						onClick={onToggleStar}
						tone="star"
						className={cn(isStarred && "text-yellow-500")}
					>
						<Icon name={isStarred ? "star-filled" : "star"} />
					</ActionButton>

					{onToggleImportant && (
						<ActionButton
							label={importantLabel}
							onClick={onToggleImportant}
							tone="important"
							className={cn(
								isImportant &&
									"text-orange-500 fill-orange-500 [&_svg]:fill-orange-500",
							)}
						>
							<Icon name="zap" />
						</ActionButton>
					)}

					{showRestore ? (
						<ActionButton
							label="Move to inbox"
							onClick={inArchive ? onUnarchive : onRestore}
							tone="archive"
						>
							<Icon name="inbox" />
						</ActionButton>
					) : (
						<ActionButton
							label="Archive"
							onClick={onArchive}
							tone="archive"
						>
							<Icon name="archive" />
						</ActionButton>
					)}

					{!inSpam && (
						<ActionButton
							label="Move to spam"
							onClick={onMarkSpam}
							tone="spam"
						>
							<Icon name="alert" />
						</ActionButton>
					)}

					<ActionButton
						label="Print thread"
						onClick={onPrint}
						tone="print"
					>
						<Icon name="printer" />
					</ActionButton>

					{onUnsubscribe && (
						<ActionButton
							label="Unsubscribe"
							onClick={onUnsubscribe}
							tone="unsubscribe"
						>
							<Icon name="link" />
						</ActionButton>
					)}

					<ActionButton
						label={trashLabel}
						onClick={onDelete}
						tone="danger"
					>
						<Icon name="trash" />
					</ActionButton>
				</div>
			</div>
		</Tooltip.Provider>
	);
};
