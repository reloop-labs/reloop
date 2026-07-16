import * as Button from "@reloop/ui/button";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Icon-based format toggle button (Bold, Italic, Underline, Strike)   */
/* ------------------------------------------------------------------ */
export function MarkButton({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	icon: LucideIcon;
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
			<Button.Icon asChild className="h-3.5 w-3.5">
				<Icon strokeWidth={2.5} />
			</Button.Icon>
		</Button.Root>
	);
}
