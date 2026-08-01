import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export type WebhookHeaderMenuAction =
	| "edit"
	| "docs"
	| "copy-url"
	| "copy-id"
	| "pause"
	| "resume"
	| "toggle"
	| "delete";

export function WebhookHeaderMenu({
	status,
	onAction,
}: {
	status: "active" | "paused" | "disabled" | "failed";
	onAction: (id: WebhookHeaderMenuAction) => void;
}) {
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const isDisabled = status === "disabled";
	const isPaused = status === "paused";
	const isActive = status === "active" || status === "failed";

	const menuItems: {
		id: WebhookHeaderMenuAction;
		label: string;
		icon: string;
		isDanger: boolean;
		dividerAfter?: boolean;
	}[] = [
		{
			id: "edit",
			label: "Edit webhook",
			icon: "edit",
			isDanger: false,
		},
		{
			id: "docs",
			label: "Go to docs",
			icon: "file-text",
			isDanger: false,
			dividerAfter: true,
		},
		{
			id: "copy-url",
			label: "Copy URL",
			icon: "copy",
			isDanger: false,
		},
		{
			id: "copy-id",
			label: "Copy ID",
			icon: "copy",
			isDanger: false,
			dividerAfter: true,
		},
		...(isPaused
			? [
					{
						id: "resume" as const,
						label: "Resume",
						icon: "play",
						isDanger: false,
					},
				]
			: isActive
				? [
						{
							id: "pause" as const,
							label: "Pause",
							icon: "pause",
							isDanger: false,
						},
					]
				: []),
		{
			id: "toggle",
			label: isDisabled ? "Enable webhook" : "Disable webhook",
			icon: isDisabled ? "check-circle" : "minus-circle",
			isDanger: false,
			dividerAfter: true,
		},
		{
			id: "delete",
			label: "Delete webhook",
			icon: "trash",
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	return (
		<Dropdown.Root
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setHoverIdx(undefined);
			}}
		>
			<Dropdown.Trigger asChild>
				<Button.Root variant="neutral" mode="stroke" size="xsmall">
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
			>
				<div className="relative">
					{menuItems.map((item, idx) => (
						<div key={item.id}>
							<button
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => {
									onAction(item.id);
									setOpen(false);
								}}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								)}
							>
								<Icon
									name={item.icon}
									className={cn(
										"h-4 w-4",
										item.isDanger ? "" : "text-text-sub-600",
									)}
								/>
								<span>{item.label}</span>
							</button>
							{item.dividerAfter ? (
								<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
							) : null}
						</div>
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
