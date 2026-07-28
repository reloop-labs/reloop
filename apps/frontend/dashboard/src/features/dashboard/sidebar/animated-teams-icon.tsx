import { cn } from "@reloop/ui/cn";

type AnimatedTeamsIconProps = {
	className?: string;
};

/**
 * Teams ID card: hangs from the top straps, sways once like a wind gust, settles.
 * Place inside an element with the `group` class.
 */
export function AnimatedTeamsIcon({ className }: AnimatedTeamsIconProps) {
	return (
		<span
			className={cn(
				"inline-flex h-4 w-4 shrink-0 origin-top motion-safe:group-data-[animating=true]:animate-teams-hang",
				className,
			)}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden
				className="h-full w-full"
			>
				<path
					d="M16 2v2M17.915 22a6 6 0 0 0-12 0M8 2v2"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle
					cx={12}
					cy={12}
					r={4}
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<rect
					x={3}
					y={4}
					width={18}
					height={18}
					rx={2}
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</span>
	);
}
