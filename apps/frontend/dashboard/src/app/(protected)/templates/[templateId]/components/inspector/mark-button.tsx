export function MarkButton({
	label,
	active,
	onClick,
	className = "",
}: {
	label: string;
	active: boolean;
	onClick: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`h-6 w-6 cursor-pointer rounded border text-xs ${
				active
					? "border-(--re-text) bg-(--re-text) text-(--re-bg)"
					: "border-(--re-border) bg-transparent text-(--re-text)"
			} ${className}`}
		>
			{label}
		</button>
	);
}
