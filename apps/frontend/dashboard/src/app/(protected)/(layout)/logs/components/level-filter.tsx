"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { useState } from "react";

const LOG_LEVELS = [
	{
		value: "debug",
		label: "Debug",
		color: "text-text-sub-600",
		bgColor: "bg-neutral-alpha-10",
	},
	{
		value: "info",
		label: "Info",
		color: "text-primary-base",
		bgColor: "bg-primary-alpha-10",
	},
	{
		value: "warn",
		label: "Warning",
		color: "text-warning-base",
		bgColor: "bg-warning-alpha-10",
	},
	{
		value: "error",
		label: "Error",
		color: "text-error-base",
		bgColor: "bg-error-alpha-10",
	},
	{
		value: "fatal",
		label: "Fatal",
		color: "text-error-base",
		bgColor: "bg-error-alpha-10",
	},
] as const;

interface LevelFilterProps {
	activeLevel: string | null;
	onLevelChange: (level: string | null) => void;
}

export const LevelFilter = ({
	activeLevel,
	onLevelChange,
}: LevelFilterProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const activeLevelConfig = LOG_LEVELS.find((l) => l.value === activeLevel);

	const handleSelect = (level: string) => {
		if (activeLevel === level) {
			onLevelChange(null);
		} else {
			onLevelChange(level);
		}
		setIsOpen(false);
	};

	const handleClear = () => {
		onLevelChange(null);
		setIsOpen(false);
	};

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className={cn(
						"gap-1.5 whitespace-nowrap",
						activeLevel &&
							"border-primary-base/30 bg-primary-alpha-10 text-primary-base",
					)}
				>
					<Button.Icon>
						<Icon name="filter" className="h-4 w-4" />
					</Button.Icon>
					{activeLevelConfig ? activeLevelConfig.label : "Level"}
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Popover.Trigger>

			<Popover.Content
				align="start"
				showArrow={false}
				className="w-[200px] p-2"
			>
				<div className="flex flex-col gap-0.5">
					{LOG_LEVELS.map((level) => (
						<button
							key={level.value}
							type="button"
							onClick={() => handleSelect(level.value)}
							className={cn(
								"flex items-center justify-between rounded-lg px-3 py-2 text-left text-paragraph-sm transition-colors",
								activeLevel === level.value
									? "bg-primary-alpha-10 font-medium text-primary-base"
									: "text-text-strong-950 hover:bg-bg-weak-50",
							)}
						>
							<div className="flex items-center gap-2">
								<span
									className={cn(
										"inline-flex h-2 w-2 rounded-full",
										level.value === "debug" && "bg-text-sub-600",
										level.value === "info" && "bg-primary-base",
										level.value === "warn" && "bg-warning-base",
										(level.value === "error" || level.value === "fatal") &&
											"bg-error-base",
									)}
								/>
								{level.label}
							</div>
							{activeLevel === level.value && (
								<Icon name="check" className="h-4 w-4" />
							)}
						</button>
					))}

					{activeLevel && (
						<>
							<div className="my-1 border-stroke-soft-200 border-t" />
							<button
								type="button"
								onClick={handleClear}
								className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-error-base text-paragraph-sm transition-colors hover:bg-error-alpha-10"
							>
								<Icon name="cross" className="h-4 w-4" />
								Clear filter
							</button>
						</>
					)}
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};
