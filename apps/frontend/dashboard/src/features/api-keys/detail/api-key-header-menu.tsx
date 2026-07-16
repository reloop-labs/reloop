import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

const menuItems = [
	{
		id: "docs" as const,
		label: "Go to docs",
		icon: "file-text" as const,
		isDanger: false,
	},
	{
		id: "rotate" as const,
		label: "Rotate key",
		icon: "rotate-cw" as const,
		isDanger: false,
	},
	{
		id: "edit" as const,
		label: "Edit API key",
		icon: "edit" as const,
		isDanger: false,
	},
	{
		id: "delete" as const,
		label: "Delete API key",
		icon: "trash" as const,
		isDanger: true,
	},
];

export type HeaderMenuAction = (typeof menuItems)[number]["id"];

export function ApiKeyHeaderMenu({
	onAction,
}: {
	onAction: (id: HeaderMenuAction) => void;
}) {
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

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
					<Icon name="more-horizontal" className="h-3.5 w-3.5 text-text-sub-600" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				align="end"
				sideOffset={6}
				className="w-44 gap-0 rounded-xl p-1.5"
			>
				<div className="relative">
					{menuItems.map((item, idx) => (
						<button
							key={item.id}
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
