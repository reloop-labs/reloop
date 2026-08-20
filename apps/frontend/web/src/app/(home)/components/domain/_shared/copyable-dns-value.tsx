import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

export function CopyableDnsValue({
	value,
	mono = false,
}: {
	value: string;
	mono?: boolean;
}) {
	return (
		<span
			className={cn(
				"group/copy flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden rounded-md px-1.5 py-0.5",
			)}
		>
			<span
				className={cn(
					"min-w-0 flex-1 truncate text-label-sm",
					mono
						? "font-mono text-text-sub-600"
						: "font-medium text-text-strong-950",
				)}
			>
				{value}
			</span>
			<span className="relative h-3.5 w-3.5 shrink-0" aria-hidden>
				<Icon
					name="copy"
					className="absolute inset-0 h-3.5 w-3.5 text-text-sub-600/50"
				/>
			</span>
		</span>
	);
}
