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
		<button
			type="button"
			title={title}
			disabled={disabled}
			onClick={onClick}
			className={`flex h-6 w-6 items-center justify-center rounded border transition-colors disabled:pointer-events-none disabled:opacity-40 ${
				active
					? "border-(--re-text) bg-(--re-text) text-(--re-bg)"
					: "border-(--re-border) bg-transparent text-(--re-text)"
			} ${className}`}
		>
			{children}
		</button>
	);
}
