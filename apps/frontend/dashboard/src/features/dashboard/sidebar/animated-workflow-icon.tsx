import { cn } from "@reloop/ui/cn";

type AnimatedWorkflowIconProps = {
	className?: string;
};

/**
 * Workflow icon with the S-curve path drawing on group hover.
 * Nodes and arrow stay static. Place inside an element with the `group` class.
 */
export function AnimatedWorkflowIcon({ className }: AnimatedWorkflowIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Start node — static */}
			<path
				d="M8 19C8 20.6569 6.65685 22 5 22C3.34315 22 2 20.6569 2 19C2 17.3431 3.34315 16 5 16C6.65685 16 8 17.3431 8 19Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* End node — static */}
			<path
				d="M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Arrow — static */}
			<path
				d="M9.5 7.5L12 5L9.5 2.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* S-curve path — draws start → end */}
			<path
				d="M8 19H16.5C18.433 19 20 17.433 20 15.5C20 13.567 18.433 12 16.5 12H6.5C4.567 12 3 10.433 3 8.5C3 6.567 4.567 5 6.5 5H12"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-workflow-path-draw"
			/>
		</svg>
	);
}
