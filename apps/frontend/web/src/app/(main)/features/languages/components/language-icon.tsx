import type { SimpleIcon } from "simple-icons";

export function LanguageIcon({
	icon,
	className = "size-6",
}: {
	icon: SimpleIcon;
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={`fill-current ${className}`}
			aria-hidden
		>
			<path d={icon.path} />
		</svg>
	);
}
