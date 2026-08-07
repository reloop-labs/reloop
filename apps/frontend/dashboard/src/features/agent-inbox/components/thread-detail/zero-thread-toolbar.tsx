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

type ActionTone =
	| "neutral"
	| "important"
	| "archive"
	| "spam"
	| "print"
	| "unsubscribe"
	| "danger";

const toneClass: Record<ActionTone, string> = {
	neutral: "text-mail-muted hover:text-mail-foreground",
	important: "text-mail-muted hover:text-orange-600 dark:hover:text-orange-300",
	archive: "text-mail-muted hover:text-sky-600 dark:hover:text-sky-300",
	spam: "text-mail-muted hover:text-rose-600 dark:hover:text-rose-300",
	print: "text-mail-muted hover:text-slate-700 dark:hover:text-slate-200",
	unsubscribe: "text-mail-muted hover:text-teal-600 dark:hover:text-teal-300",
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
			className="pointer-events-none fixed z-[9999] -translate-x-1/2 rounded bg-neutral-900 px-2 py-1 font-medium text-[11px] text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
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
	isImportant,
	folder,
	onClose,
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
	isImportant?: boolean;
	folder?: string;
	onClose?: () => void;
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
	const importantLabel = isImportant ? "Unmark important" : "Mark important";
	const trashLabel = inTrash ? "Delete forever" : "Move to trash";

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
		<div className="flex shrink-0 items-center gap-1 px-1 pb-[10px] md:px-3 md:pt-3 md:pb-[11px]">
			{(showBack || onClose) && (
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
			)}

			{(showBack || onClose) && (
				<span
					className="mx-0.5 h-4 w-px shrink-0 bg-mail-border/60"
					aria-hidden
				/>
			)}

			{onToggleImportant && (
				<ActionButton
					label={importantLabel}
					onClick={onToggleImportant}
					tone="important"
					className={cn(
						isImportant &&
							"fill-orange-500 text-orange-500 [&_svg]:fill-orange-500",
					)}
					onShowTip={showTip}
					onHideTip={hideTip}
				>
					<Icon name="zap" />
				</ActionButton>
			)}

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
					label="Move to spam"
					onClick={onMarkSpam}
					tone="spam"
					onShowTip={showTip}
					onHideTip={hideTip}
				>
					<Icon name="alert" />
				</ActionButton>
			)}

			<ActionButton
				label="Print thread"
				onClick={onPrint}
				tone="print"
				onShowTip={showTip}
				onHideTip={hideTip}
			>
				<Icon name="printer" />
			</ActionButton>

			{onUnsubscribe && (
				<ActionButton
					label="Unsubscribe"
					onClick={onUnsubscribe}
					tone="unsubscribe"
					onShowTip={showTip}
					onHideTip={hideTip}
				>
					<Icon name="link" />
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

			<ToolbarTip tip={tip} />
		</div>
	);
};
