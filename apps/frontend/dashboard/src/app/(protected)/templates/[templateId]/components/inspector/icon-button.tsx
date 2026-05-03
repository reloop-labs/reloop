import * as Button from "@reloop/ui/button";
import React from "react";

export interface IconButtonProps {
	onClick: () => void;
	title: string;
	active?: boolean;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
}

export function IconButton({
	onClick,
	title,
	active = false,
	disabled = false,
	children,
	className = "",
}: IconButtonProps) {
	return (
		<Button.Root
			type="button"
			title={title}
			disabled={disabled}
			onClick={onClick}
			size="xxsmall"
			variant="neutral"
			mode={active ? "filled" : "stroke"}
			className={`h-6 w-6 p-0 ${className}`}
		>
			<Button.Icon asChild className="size-3.5">
				{children}
			</Button.Icon>
		</Button.Root>
	);
}
