import { cn } from "@reloop/ui/cn";

type AnimatedRobotIconProps = {
	className?: string;
};

/**
 * Robot head that nods, blinks, and redraws its antenna on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedRobotIcon({ className }: AnimatedRobotIconProps) {
	return (
		<span
			className={cn(
				"inline-flex h-4 w-4 shrink-0 origin-center motion-safe:group-data-[animating=true]:animate-robot-nod",
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
				{/* Soft head fill */}
				<rect
					opacity="0.12"
					x={4}
					y={8}
					width={16}
					height={12}
					rx={2}
					fill="currentColor"
				/>
				{/* Head shell */}
				<rect
					x={4}
					y={8}
					width={16}
					height={12}
					rx={2}
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				{/* Antenna redraws on hover */}
				<path
					d="M12 8V4H8"
					pathLength={1}
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-robot-antenna"
				/>
				{/* Ears */}
				<path
					d="M2 14H4"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M20 14H22"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				{/* Eyes blink on hover */}
				<path
					d="M15 13V15"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="origin-center motion-safe:group-data-[animating=true]:animate-robot-blink"
					style={{ transformBox: "fill-box" }}
				/>
				<path
					d="M9 13V15"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="origin-center motion-safe:group-data-[animating=true]:animate-robot-blink"
					style={{ transformBox: "fill-box" }}
				/>
			</svg>
		</span>
	);
}
