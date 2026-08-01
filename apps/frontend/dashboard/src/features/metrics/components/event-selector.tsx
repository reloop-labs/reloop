import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export const EVENTS = [
	{ id: "received", label: "Received", color: "#0E7090" },
	{ id: "delivered", label: "Delivered", color: "#10B981" },
	{ id: "opened", label: "Opened", color: "#3B82F6" },
	{ id: "clicked", label: "Clicked", color: "#8B5CF6" },
	{ id: "bounced", label: "Bounced", color: "#EF4444" },
	{ id: "complained", label: "Complained", color: "#D97706" },
	{ id: "unsubscribed", label: "Unsubscribed", color: "#F97316" },
	{ id: "delivery_delayed", label: "Delivery delayed", color: "#6B7280" },
	{ id: "failed", label: "Failed", color: "#EC4899" },
	{ id: "suppressed", label: "Suppressed", color: "#4B5563" },
] as const;

interface EventSelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
}

export const EventSelector = ({ value, onChange }: EventSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const isAllSelected =
		value.length === 0 ||
		value.includes("all") ||
		value.length === EVENTS.length;

	const handleSelectAll = () => {
		onChange([]);
	};

	const handleToggleEvent = (eventId: string) => {
		if (value.includes(eventId)) {
			const newValue = value.filter((id) => id !== eventId);
			onChange(newValue);
		} else {
			const newValue = [...value.filter((id) => id !== "all"), eventId];
			onChange(newValue);
		}
	};

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const triggerLabel = (() => {
		if (isAllSelected) return "All Events";
		if (value.length === 1) {
			return EVENTS.find((e) => e.id === value[0])?.label || "Events";
		}
		return `${value.length} Events`;
	})();

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className={cn(
						"gap-1.5 whitespace-nowrap rounded-xl",
						!isAllSelected &&
							"border-stroke-soft-900 bg-neutral-alpha-10 text-text-strong-950",
					)}
				>
					<div className="flex items-center gap-1.5">
						{!isAllSelected && value.length === 1 ? (
							<div
								className="h-2 w-2 rounded-full"
								style={{
									backgroundColor: EVENTS.find((e) => e.id === value[0])?.color,
								}}
							/>
						) : (
							<div className="h-2 w-2 rounded-full border border-current" />
						)}
						<span>{triggerLabel}</span>
					</div>
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="end" className="w-56 p-2">
				<div className="relative max-h-80 overflow-y-auto">
					<button
						ref={(el) => {
							if (el) buttonRefs.current[0] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(0)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={handleSelectAll}
						className={cn(
							"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
							"text-text-strong-950",
							isAllSelected && "bg-neutral-alpha-10",
							!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
						)}
					>
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full border border-current" />
							<span className={cn(isAllSelected && "font-medium")}>
								All Events
							</span>
						</div>
						{isAllSelected && (
							<Icon name="check" className="h-3.5 w-3.5 text-text-strong-950" />
						)}
					</button>

					<div>
						{EVENTS.map((event, idx) => {
							const isSelected = !isAllSelected && value.includes(event.id);
							const index = idx + 1;
							return (
								<button
									key={event.id}
									ref={(el) => {
										if (el) buttonRefs.current[index] = el;
									}}
									type="button"
									onPointerEnter={() => setHoverIdx(index)}
									onPointerLeave={() => setHoverIdx(undefined)}
									onClick={() => handleToggleEvent(event.id)}
									className={cn(
										"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
										"text-text-strong-950",
										isSelected && "bg-neutral-alpha-10",
										!currentRect && hoverIdx === index && "bg-neutral-alpha-10",
									)}
								>
									<div className="flex items-center gap-2 truncate">
										<div
											className="h-2 w-2 shrink-0 rounded-full"
											style={{ backgroundColor: event.color }}
										/>
										<span
											className={cn(isSelected && "font-medium", "truncate")}
										>
											{event.label}
										</span>
									</div>
									{isSelected && (
										<Icon
											name="check"
											className="h-3.5 w-3.5 text-text-strong-950"
										/>
									)}
								</button>
							);
						})}
					</div>

					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
