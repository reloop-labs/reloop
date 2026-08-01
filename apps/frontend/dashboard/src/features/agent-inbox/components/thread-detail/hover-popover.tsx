import * as Popover from "@reloop/ui/popover";
import { type ReactNode, useRef, useState } from "react";

const OPEN_DELAY_MS = 280;
const CLOSE_DELAY_MS = 160;

/**
 * Popover that opens on hover (tooltip-like), not click.
 * Content stays open while the pointer is over the trigger or panel.
 */
export function HoverPopover({
	trigger,
	children,
	align = "start",
	side = "bottom",
	sideOffset = -3,
	showArrow = true,
	contentClassName,
	openDelay = OPEN_DELAY_MS,
}: {
	trigger: ReactNode;
	children: ReactNode;
	align?: "start" | "center" | "end";
	side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
	showArrow?: boolean;
	contentClassName?: string;
	openDelay?: number;
}) {
	const [open, setOpen] = useState(false);
	const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearTimers = () => {
		if (openTimer.current) {
			clearTimeout(openTimer.current);
			openTimer.current = null;
		}
		if (closeTimer.current) {
			clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
	};

	const scheduleOpen = () => {
		clearTimers();
		openTimer.current = setTimeout(() => setOpen(true), openDelay);
	};

	const openNow = () => {
		clearTimers();
		setOpen(true);
	};

	const scheduleClose = () => {
		clearTimers();
		closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
	};

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger asChild>
				<span
					className="inline-flex"
					onPointerEnter={scheduleOpen}
					onPointerLeave={scheduleClose}
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					{trigger}
				</span>
			</Popover.Trigger>
			<Popover.Content
				align={align}
				side={side}
				sideOffset={sideOffset}
				collisionPadding={4}
				arrowPadding={4}
				avoidCollisions={false}
				showArrow={showArrow}
				className={contentClassName}
				onPointerEnter={openNow}
				onPointerLeave={scheduleClose}
				onOpenAutoFocus={(e) => e.preventDefault()}
				onCloseAutoFocus={(e) => e.preventDefault()}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</Popover.Content>
		</Popover.Root>
	);
}
