import { cn } from "@reloop/ui/cn";

type AnimatedProfileIconProps = {
	className?: string;
};

/**
 * Profile: head stays; shoulders draw L→R on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedProfileIcon({ className }: AnimatedProfileIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Head — static */}
			<path
				d="M16 6C16 8.20914 14.2091 10 12 10C9.79086 10 8 8.20914 8 6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6Z"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* Shoulders — L→R */}
			<path
				d="M4 18.8C4 16.149 6.14903 14 8.8 14H15.2C17.851 14 20 16.149 20 18.8C20 20.5673 18.5673 22 16.8 22H7.2C5.43269 22 4 20.5673 4 18.8Z"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-profile-shoulders"
			/>
		</svg>
	);
}
