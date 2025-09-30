"use client";

import { useLayout } from "@dashboard/providers/layout-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface LayoutToggleButtonProps {
	className?: string;
	size?: "small" | "medium" | "xsmall" | "xxsmall";
}

export const LayoutToggleButton: React.FC<LayoutToggleButtonProps> = ({
	className,
	size = "small",
}) => {
	const { layoutMode, toggleLayoutMode } = useLayout();

	const isTopbar = layoutMode === "topbar";
	const tooltip = isTopbar ? "Switch to Sidebar" : "Switch to Topbar";

	return (
		<Button.Root
			variant="neutral"
			mode="ghost"
			size={size}
			onClick={toggleLayoutMode}
			className={className}
			title={tooltip}
		>
			<Button.Icon>
				<Icon name="grid-5" />
			</Button.Icon>
		</Button.Root>
	);
};
