import { cn } from "@reloop/ui/cn";

type AnimatedGroupsIconProps = {
	className?: string;
};

/**
 * Groups icon with front person drawing on group hover.
 * Back person stays static. Place inside an element with the `group` class.
 */
export function AnimatedGroupsIcon({ className }: AnimatedGroupsIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Back person — static */}
			<path
				d="M15 10C17.2091 10 19 8.20914 19 6C19 3.79086 17.2091 2 15 2"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M17 22H19.8C21.5673 22 23 20.5673 23 18.8C23 16.149 20.851 14 18.2 14H17"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Front person — head then shoulders */}
			<path
				d="M12 6C12 8.20914 10.2091 10 8 10C5.79086 10 4 8.20914 4 6C4 3.79086 5.79086 2 8 2C10.2091 2 12 3.79086 12 6Z"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-groups-draw-front"
			/>
			<path
				d="M4.2 22H11.8C13.5673 22 15 20.5673 15 18.8C15 16.149 12.851 14 10.2 14H5.8C3.14903 14 1 16.149 1 18.8C1 20.5673 2.43269 22 4.2 22Z"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-groups-draw-back"
			/>
		</svg>
	);
}
