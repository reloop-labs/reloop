import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export type HeaderMenuAction =
	| "docs"
	| "copy-prefix"
	| "copy-id"
	| "toggle"
	| "edit"
	| "rotate"
	| "delete";

export function ApiKeyHeaderMenu({
	enabled,
	onAction,
}: {
	enabled: boolean;
	onAction: (id: HeaderMenuAction) => void;
}) {
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems: {
		id: HeaderMenuAction;
		label: string;
		icon: string;
		isDanger: boolean;
		dividerAfter?: boolean;
	}[] = [
		{
			id: "edit",
			label: "Edit API key",
			icon: "edit",
			isDanger: false,
		},
		{
			id: "rotate",
			label: "Rotate key",
			icon: "rotate-cw",
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
			id: "copy-prefix",
			label: "Copy prefix",
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
		{
			id: "toggle",
			label: enabled ? "Disable API key" : "Enable API key",
			icon: enabled ? "cross-circle" : "check-circle",
			isDanger: false,
			dividerAfter: true,
		},
		{
			id: "delete",
			label: "Delete API key",
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
