import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { SVGProps } from "react";

export function KbdEnter({ className, ...rest }: SVGProps<SVGSVGElement>) {
	return (
		<Icon
			name="enter"
			className={cn(
				"h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px",
				className,
			)}
			{...rest}
		/>
	);
}
