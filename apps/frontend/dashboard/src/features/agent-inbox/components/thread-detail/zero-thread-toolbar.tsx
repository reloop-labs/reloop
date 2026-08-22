"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

const iconBtnBase = cn(
	"inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-lg",
	"bg-transparent transition-[transform,color] duration-150 ease-out",
	"active:scale-[0.97]",
);

type ActionTone = "neutral" | "archive" | "spam" | "danger";

const toneClass: Record<ActionTone, string> = {
	neutral: "text-mail-muted hover:text-mail-foreground",
	archive: "text-mail-muted hover:text-sky-600 dark:hover:text-sky-300",
	spam: "text-mail-muted hover:text-rose-600 dark:hover:text-rose-300",
	danger:
		"text-[var(--inbox-danger-fg)] hover:text-red-600 dark:hover:text-red-300",
};

type TipState = {
	label: string;
	x: number;
	y: number;
};

/** One floating label for the whole toolbar — never stacks multiple tooltips. */
function ToolbarTip({ tip }: { tip: TipState | null }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted || !tip) return null;

	return createPortal(
		<div
			role="tooltip"
			className="-translate-x-1/2 pointer-events-none fixed z-[9999] rounded bg-neutral-900 px-2 py-1 font-medium text-[11px] text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
			style={{ left: tip.x, top: tip.y }}
		>
			{tip.label}
		</div>,
		document.body,
	);
}

const ActionButton = ({
	label,
	onClick,
	tone = "neutral",
	className,
	children,
	onShowTip,
	onHideTip,
}: {
	label: string;
	onClick?: () => void;
	tone?: ActionTone;
	className?: string;
	children: ReactNode;
	onShowTip: (label: string, el: HTMLElement) => void;
	onHideTip: () => void;
}) => (
	<button
		type="button"
		onClick={onClick}
		aria-label={label}
		className={cn(iconBtnBase, toneClass[tone], className)}
		onPointerEnter={(e) => onShowTip(label, e.currentTarget)}
		onPointerLeave={onHideTip}
		onFocus={(e) => onShowTip(label, e.currentTarget)}
		onBlur={onHideTip}
	>
		<span className="relative flex h-3.5 w-3.5 items-center justify-center text-current [&_svg]:h-3.5 [&_svg]:w-3.5">
			{children}
		</span>
	</button>
);

export const ZeroThreadToolbar = ({
	isUnread,
	folder,
	onClose,
	onArchive,
	onUnarchive,
	onRestore,
	onDelete,
	onMarkSpam,
	onMarkUnread,
	onMarkRead,
	onLabels,
	showBack,
}: {
	isUnread?: boolean;
	folder?: string;
	onClose?: () => void;
	onArchive: () => void;
	onUnarchive?: () => void;
	onRestore?: () => void;
	onDelete: () => void;
	onMarkSpam: () => void;
	onMarkUnread?: () => void;
	onMarkRead?: () => void;
	onLabels?: () => void;
	showBack?: boolean;
}) => {
	const inArchive = folder === "archive" || folder === "archived";
	const inTrash = folder === "trash";
	const inSpam = folder === "spam";
	const showRestore = inArchive || inTrash || inSpam;
	const trashLabel = inTrash ? "Delete forever" : "Move to trash";
	const readLabel = isUnread ? "Mark as read" : "Mark as unread";

	const [tip, setTip] = useState<TipState | null>(null);
	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearHideTimer = () => {
		if (hideTimer.current) {
			clearTimeout(hideTimer.current);
			hideTimer.current = null;
		}
	};

	const showTip = useCallback((label: string, el: HTMLElement) => {
		clearHideTimer();
		const rect = el.getBoundingClientRect();
		setTip({
			label,
			x: rect.left + rect.width / 2,
			y: rect.bottom + 6,
		});
	}, []);

	const hideTip = useCallback(() => {
		clearHideTimer();
		// Tiny delay so moving between adjacent icons doesn't flash
		hideTimer.current = setTimeout(() => setTip(null), 40);
	}, []);

	useEffect(() => {
		return () => clearHideTimer();
	}, []);

	return (
		<div className="flex h-11 shrink-0 items-center gap-1 px-3">
			{(showBack || onClose) && (
				<div className="mr-2 ml-0">
					<ActionButton
						label={showBack ? "Back to list" : "Close"}
						onClick={onClose}
						tone="neutral"
						className="inline-flex"
						onShowTip={showTip}
						onHideTip={hideTip}
					>
						<Icon name={showBack ? "arrow-left" : "cross"} />
					</ActionButton>
				</div>
			)}

			{/* Gmail primary actions: archive · spam · trash */}
			{showRestore ? (
				<ActionButton
					label="Move to inbox"
					onClick={inArchive ? onUnarchive : onRestore}
					tone="archive"
					onShowTip={showTip}
					onHideTip={hideTip}
				>
					<Icon name="inbox" />
				</ActionButton>
			) : (
				<ActionButton
					label="Archive"
					onClick={onArchive}
					tone="archive"
					onShowTip={showTip}
					onHideTip={hideTip}
				>
					<Icon name="archive" />
				</ActionButton>
			)}

			{!inSpam && (
				<ActionButton
					label="Report spam"
					onClick={onMarkSpam}
					tone="spam"
					onShowTip={showTip}
					onHideTip={hideTip}
				>
					<Icon name="alert-octagon" />
				</ActionButton>
			)}

			<ActionButton
				label={trashLabel}
				onClick={onDelete}
				tone="danger"
				onShowTip={showTip}
				onHideTip={hideTip}
			>
				<Icon name="trash" />
			</ActionButton>

			{/* Secondary: mark read/unread · move (Gmail order) */}
			{(onMarkUnread || onMarkRead) && (
				<ActionButton
					label={readLabel}
					onClick={isUnread ? onMarkRead : onMarkUnread}
					tone="neutral"
					onShowTip={showTip}
					onHideTip={hideTip}
				>
					<Icon name="mail" />
				</ActionButton>
			)}

			<ToolbarTip tip={tip} />
		</div>
	);
};
