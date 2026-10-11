import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Icon-based format toggle button (Bold, Italic, Underline, Strike)   */
/* ------------------------------------------------------------------ */
export function MarkButton({
	icon,
	label,
	active,
	onClick,
}: {
	/** Sprite icon name, or a custom node (e.g. letter glyph). */
	icon: string | ReactNode;
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<Button.Root
			type="button"
			onClick={onClick}
			title={label}
			aria-label={label}
			aria-pressed={active}
			variant="neutral"
			mode={active ? "filled" : "stroke"}
			size="xxsmall"
			className="h-8 w-8 rounded-lg"
		>
			{typeof icon === "string" ? (
				<Button.Icon asChild className="h-3.5 w-3.5">
					<Icon name={icon} className="h-3.5 w-3.5" />
				</Button.Icon>
			) : (
				<span className="flex h-3.5 w-3.5 items-center justify-center text-[11px] leading-none">
					{icon}
				</span>
			)}
		</Button.Root>
	);
}
