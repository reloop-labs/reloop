"use client";

import { useLayout } from "@dashboard/providers/layout-provider";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

interface LayoutToggleButtonProps {
	className?: string;
}

export const LayoutToggleButton: React.FC<LayoutToggleButtonProps> = ({
	className,
}) => {
	const { layoutMode, setLayoutMode } = useLayout();

	const layoutOptions = [
		{
			value: "sidebar",
			label: "Sidebar",
			icon: "grid-5",
		},
		{
			value: "topbar",
			label: "Topbar",
			icon: "grid-5",
		},
	];

	return (
		<div className={cn("flex gap-2", className)}>
			{layoutOptions.map((option) => (
				<button
					type="button"
					key={option.value}
					onClick={() => setLayoutMode(option.value as "sidebar" | "topbar")}
					className={cn(
						"rounded-xl border px-3 pt-2 pb-2.5 transition-all duration-200",
						layoutMode === option.value
							? "border-primary-500 bg-primary-50"
							: "border-stroke-soft-100 hover:border-stroke-soft-200",
					)}
				>
					<div className="flex items-center justify-center gap-2 pt-2">
						<Icon
							name={option.icon}
							className={cn(
								"h-20 w-20",
								layoutMode === option.value
									? "text-primary-600"
									: "text-text-sub-600",
							)}
						/>
						<p className={cn("text-sm", "font-medium text-primary-600")}>
							{option.label}
						</p>
					</div>
				</button>
			))}
		</div>
	);
};
