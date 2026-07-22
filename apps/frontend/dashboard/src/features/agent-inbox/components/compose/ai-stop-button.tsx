import { cn } from "@reloop/ui/cn";

/**
 * ChatGPT-style stop control: circle with a filled square.
 * Used to cancel AI generation (replaces Esc chrome).
 */
export const AiStopButton = ({
	onClick,
	className,
	title = "Stop generating",
}: {
	onClick: () => void;
	className?: string;
	title?: string;
}) => (
	<button
		type="button"
		onClick={onClick}
		title={title}
		aria-label={title}
		className={cn(
			"inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
			"border border-mail-foreground/15 bg-mail-foreground text-mail-background",
			"transition-[opacity,transform,background-color] duration-150 ease-out",
			"hover:opacity-90 active:scale-[0.94]",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mail-foreground/25",
			className,
		)}
	>
		<span
			aria-hidden
			className="block h-1.5 w-1.5 rounded-[1px] bg-mail-background"
		/>
	</button>
);
