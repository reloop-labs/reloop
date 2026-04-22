import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Tooltip from "@reloop/ui/tooltip";
import { useState } from "react";

interface PaddingInputProps {
	label: string;
	icon: string;
	iconClassName?: string;
	placeholder?: string;
}

const PaddingInput = ({
	label,
	icon,
	iconClassName,
	placeholder = "0",
}: PaddingInputProps) => (
	<Tooltip.Root>
		<Tooltip.Trigger asChild>
			<div className="flex-1">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Icon
							as={Icon}
							name={icon}
							className={cn("h-3.5 w-3.5 text-text-sub-600", iconClassName)}
						/>
						<Input.Input
							type="text"
							placeholder={placeholder}
							className="text-center"
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
		</Tooltip.Trigger>
		<Tooltip.Content
			size="xsmall"
			side="bottom"
			variant="light"
			className="text-xs"
		>
			Padding {label}
		</Tooltip.Content>
	</Tooltip.Root>
);

export const InputPadding = () => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="flex flex-col gap-2">
			{/* Header with label and toggle */}
			<div className="flex items-center justify-between">
				<Label.Root className="font-medium text-text-sub-600 text-xs">
					Padding
				</Label.Root>
				<Button.Root
					variant="neutral"
					size="xsmall"
					mode="ghost"
					onClick={() => setIsExpanded(!isExpanded)}
					className={cn(
						"h-7 w-7 transition-colors",
						isExpanded && "bg-bg-weak-50 text-shadow-text-strong-950",
					)}
				>
					<Button.Icon
						as={Icon}
						name="section-rect"
						className={cn("h-4 w-4 transition-transform")}
					/>
				</Button.Root>
			</div>

			{/* Input grid */}
			<div
				className={cn(
					"grid gap-1.5 transition-all duration-200",
					isExpanded ? "grid-cols-4" : "grid-cols-2",
				)}
			>
				{isExpanded ? (
					<>
						<PaddingInput label="Top" icon="align-top-2" iconClassName="" />
						<PaddingInput
							label="Bottom"
							icon="align-top-2"
							iconClassName="rotate-180"
						/>
						<PaddingInput
							label="Right"
							icon="align-top-2"
							iconClassName="rotate-90"
						/>
						<PaddingInput
							label="Left"
							icon="align-top-2"
							iconClassName="-rotate-90"
						/>
					</>
				) : (
					<>
						<PaddingInput
							label="Vertical"
							icon="padding-x"
							iconClassName="rotate-90"
						/>
						<PaddingInput
							label="Horizontal"
							icon="padding-x"
							iconClassName=""
						/>
					</>
				)}
			</div>
		</div>
	);
};
