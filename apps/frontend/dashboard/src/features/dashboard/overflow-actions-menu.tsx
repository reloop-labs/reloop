"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon, type IconName } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export type OverflowAction = {
	id: string;
	label: string;
	icon: IconName;
	onSelect: () => void;
	isDanger?: boolean;
	disabled?: boolean;
};

/**
 * "⋯" button with the same menu styling as the table row dropdowns
 * (compact rows, sliding hover background, red danger items).
 */
export function OverflowActionsMenu({
	actions,
	label,
	className,
}: {
	actions: OverflowAction[];
	/** Accessible name for the trigger. */
	label: string;
	className?: string;
}) {
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = actions[hoverIdx ?? -1]?.isDanger ?? false;

	return (
		<Dropdown.Root
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setHoverIdx(undefined);
			}}
		>
			<Dropdown.Trigger asChild>
				<Button.Root
					type="button"
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className={cn("aspect-square h-7 w-7 rounded-lg p-0", className)}
					aria-label={label}
				>
					<Icon
						name="more-horizontal"
						className="h-3.5 w-3.5 text-text-sub-600"
					/>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				align="end"
				sideOffset={6}
				className="w-48 gap-0 rounded-xl p-1.5"
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<div className="relative">
					{actions.map((action, idx) => (
						<button
							key={action.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							disabled={action.disabled}
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => {
								setOpen(false);
								setHoverIdx(undefined);
								action.onSelect();
							}}
							className={cn(
								"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-normal text-xs transition-colors disabled:pointer-events-none disabled:opacity-50",
								action.isDanger ? "text-error-base" : "text-text-strong-950",
								!currentRect &&
									hoverIdx === idx &&
									(action.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
							)}
						>
							<Icon
								name={action.icon}
								className={cn(
									"h-3.5 w-3.5 shrink-0",
									action.isDanger ? "" : "text-text-sub-600",
								)}
							/>
							<span>{action.label}</span>
						</button>
					))}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={isDanger}
					/>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
