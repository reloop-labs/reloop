import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import type { CreatedByUser } from "./types";

export function ApiKeyUserFilterDropdown({
	value,
	onChange,
	availableCreators,
}: {
	value: string | null;
	onChange: (value: string | null) => void;
	availableCreators: CreatedByUser[];
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const currentTab =
		hoverIdx !== undefined ? buttonRefs.current[hoverIdx] : undefined;
	const currentRect = currentTab?.getBoundingClientRect();

	const selectedCreator = availableCreators.find((c) => c.id === value);
	const displayLabel = selectedCreator
		? selectedCreator.name ||
			(selectedCreator.email ? selectedCreator.email.split("@")[0] : "Unknown")
		: "All Users";

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className="w-48 justify-between gap-1.5 whitespace-nowrap rounded-[10px]"
				>
					<div className="flex items-center gap-1.5 overflow-hidden">
						{selectedCreator ? (
							<Avatar.Root size="16" color="blue">
								{selectedCreator.image ? (
									<Avatar.Image
										src={selectedCreator.image}
										alt={selectedCreator.name || "User"}
									/>
								) : (
									<Avatar.Image asChild>
										<div
											className={cn(
												"flex h-full w-full items-center justify-center rounded-full font-medium text-[6px] text-white uppercase tracking-wide",
												getAvatarGradient(
													selectedCreator.email || "unknown@reloop.sh",
												),
											)}
										>
											{getAvatarInitial(
												selectedCreator.name,
												selectedCreator.email || "unknown@reloop.sh",
											)}
										</div>
									</Avatar.Image>
								)}
							</Avatar.Root>
						) : (
							<Icon name="user" className="h-3.5 w-3.5 shrink-0" />
						)}
						<span className="truncate">{displayLabel}</span>
					</div>
					<Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-48 p-2">
				<div className="relative max-h-64 overflow-y-auto">
					<button
						ref={(el) => {
							if (el) buttonRefs.current[0] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(0)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={() => {
							onChange(null);
							setIsOpen(false);
						}}
						className={cn(
							"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs text-text-strong-950",
							value === null && "bg-neutral-alpha-10 font-medium",
						)}
					>
						<Icon name="user" className="h-3.5 w-3.5" />
						All Users
					</button>
					{availableCreators.map((creator, idx) => {
						const i = idx + 1;
						const isChecked = value === creator.id;
						const label =
							creator.name ||
							(creator.email ? creator.email.split("@")[0] : "Unknown");
						return (
							<button
								key={creator.id}
								ref={(el) => {
									if (el) buttonRefs.current[i] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(i)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => {
									onChange(creator.id);
									setIsOpen(false);
								}}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs text-text-strong-950",
									isChecked && "bg-neutral-alpha-10 font-medium",
								)}
							>
								<Avatar.Root size="16" color="blue">
									{creator.image ? (
										<Avatar.Image
											src={creator.image}
											alt={creator.name || "User"}
										/>
									) : (
										<Avatar.Image asChild>
											<div
												className={cn(
													"flex h-full w-full items-center justify-center rounded-full font-medium text-[6px] text-white uppercase tracking-wide",
													getAvatarGradient(
														creator.email || "unknown@reloop.sh",
													),
												)}
											>
												{getAvatarInitial(
													creator.name,
													creator.email || "unknown@reloop.sh",
												)}
											</div>
										</Avatar.Image>
									)}
								</Avatar.Root>
								<span className="truncate">{label}</span>
							</button>
						);
					})}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
