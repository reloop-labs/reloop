import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import type { ApiKeyData } from "../types";

export type ApiKeyActionsHandlers = {
	togglingId: string | null;
	onToggleEnabled: (apiKey: ApiKeyData) => void;
	onRotateKey: (apiKey: ApiKeyData) => void;
	onDeleteKey: (id: string) => void;
	onOpenChange: (open: boolean, id: string) => void;
};

export function ApiKeyActionsMenu({
	apiKey,
	handlers,
}: {
	apiKey: ApiKeyData;
	handlers: ApiKeyActionsHandlers;
}) {
	const isToggling = handlers.togglingId === apiKey.id;
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems = [
		{
			id: "toggle" as const,
			label: apiKey.enabled ? "Disable" : "Enable",
			icon: (apiKey.enabled ? "cross-circle" : "check-circle") as
				| "cross-circle"
				| "check-circle",
			isDanger: false,
		},
		{
			id: "rotate" as const,
			label: "Rotate Key",
			icon: "rotate-cw" as const,
			isDanger: false,
		},
		{
			id: "delete" as const,
			label: "Delete API Key",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setHoverIdx(undefined);
		handlers.onOpenChange(next, apiKey.id);
	};

	const handleItemClick = (id: (typeof menuItems)[number]["id"]) => {
		if (id === "toggle") handlers.onToggleEnabled(apiKey);
		if (id === "rotate") handlers.onRotateKey(apiKey);
		if (id === "delete") handlers.onDeleteKey(apiKey.id);
		handleOpenChange(false);
	};

	return (
		<div
			className="flex items-center justify-end"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			{/*
			  Local open state only — component sits outside column defs so parent
			  re-renders (row highlight) never remount this and kill the open animation.
			*/}
			<Dropdown.Root open={open} onOpenChange={handleOpenChange}>
				<Dropdown.Trigger asChild>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						aria-label={`Actions for ${apiKey.name || apiKey.start || "API key"}`}
					>
						<Icon name="more-horizontal" className="h-3 w-3" />
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content
					align="end"
					sideOffset={6}
					className="w-40 gap-0 rounded-xl p-1.5"
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
								onClick={() => handleItemClick(item.id)}
								disabled={item.id === "toggle" && isToggling}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
									item.id === "toggle" &&
										isToggling &&
										"cursor-not-allowed opacity-50",
								)}
							>
								{item.id === "toggle" && isToggling ? (
									<Icon
										name="loader-2"
										className="h-3.5 w-3.5 animate-spin text-text-sub-600"
									/>
								) : (
									<Icon
										name={item.icon}
										className={cn(
											"h-3.5 w-3.5",
											item.isDanger ? "" : "text-text-sub-600",
										)}
									/>
								)}
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
		</div>
	);
}
