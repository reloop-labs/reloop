import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as ContextMenu from "@reloop/ui/context-menu";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { type ReactNode, useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export type RowAction = {
	id: string;
	label: string;
	icon: string;
	isDanger?: boolean;
	disabled?: boolean;
	onSelect: () => void;
};

const menuContentClassName = "w-48 gap-0 rounded-xl p-1.5";

/** Same look as the API keys row menu: animated hover pill, danger tint. */
function ActionItems({
	actions,
	variant,
	onDone,
}: {
	actions: RowAction[];
	variant: "dropdown" | "context";
	onDone: () => void;
}) {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const refs = useRef<HTMLElement[]>([]);
	const currentTab = refs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = actions[hoverIdx ?? -1]?.isDanger ?? false;

	const className = (action: RowAction, idx: number) =>
		cn(
			"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-normal text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
			action.isDanger ? "text-error-base" : "text-text-strong-950",
			!currentRect &&
				hoverIdx === idx &&
				(action.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
			variant === "context" &&
				"data-[disabled]:pointer-events-none data-[highlighted]:bg-transparent",
		);

	const label = (action: RowAction) => (
		<>
			<Icon
				name={action.icon}
				className={cn(
					"h-3.5 w-3.5 shrink-0",
					!action.isDanger && "text-text-sub-600",
				)}
			/>
			<span>{action.label}</span>
		</>
	);

	return (
		<div className="relative">
			{actions.map((action, idx) =>
				variant === "context" ? (
					<ContextMenu.Item
						key={action.id}
						ref={(el) => {
							if (el) refs.current[idx] = el;
						}}
						disabled={action.disabled}
						onPointerEnter={() => setHoverIdx(idx)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onSelect={() => action.onSelect()}
						className={className(action, idx)}
					>
						{label(action)}
					</ContextMenu.Item>
				) : (
					<button
						key={action.id}
						ref={(el) => {
							if (el) refs.current[idx] = el;
						}}
						type="button"
						disabled={action.disabled}
						onPointerEnter={() => setHoverIdx(idx)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={() => {
							action.onSelect();
							onDone();
						}}
						className={className(action, idx)}
					>
						{label(action)}
					</button>
				),
			)}
			<AnimatedHoverBackground
				rect={currentRect}
				tabElement={currentTab}
				isDanger={isDanger}
			/>
		</div>
	);
}

export function RowActionsMenu({
	label,
	actions,
	onOpenChange,
}: {
	label: string;
	actions: RowAction[];
	onOpenChange?: (open: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const change = (next: boolean) => {
		setOpen(next);
		onOpenChange?.(next);
	};

	return (
		<div
			className="flex items-center justify-end"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Dropdown.Root open={open} onOpenChange={change}>
				<Dropdown.Trigger asChild>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="aspect-square h-7 w-7 rounded-lg p-0"
						aria-label={`Actions for ${label}`}
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
					className={menuContentClassName}
					onCloseAutoFocus={(e) => e.preventDefault()}
				>
					<ActionItems
						actions={actions}
						variant="dropdown"
						onDone={() => change(false)}
					/>
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
}

export function RowContextMenu({
	actions,
	onOpenChange,
	children,
}: {
	actions: RowAction[];
	onOpenChange?: (open: boolean) => void;
	children: ReactNode;
}) {
	return (
		<ContextMenu.Root onOpenChange={onOpenChange}>
			<ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
			<ContextMenu.Content
				className={menuContentClassName}
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<ActionItems actions={actions} variant="context" onDone={() => {}} />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
