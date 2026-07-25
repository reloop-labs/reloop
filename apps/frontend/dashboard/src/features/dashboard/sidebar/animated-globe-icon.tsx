import { cn } from "@reloop/ui/cn";

type AnimatedGlobeIconProps = {
	className?: string;
};

/**
 * Domain globe that flips L→R (same style as Logs/Key) on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedGlobeIcon({ className }: AnimatedGlobeIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0 [perspective:48px]", className)}
		>
			<g
				className="origin-center motion-safe:group-hover:animate-globe-flip"
				style={{ transformBox: "fill-box", transformStyle: "preserve-3d" }}
			>
				<path
					d="M22 12C22 17.5228 17.5228 22 12 22M22 12C22 6.47715 17.5228 2 12 2M22 12C22 9.79086 17.5228 8 12 8C6.47715 8 2 9.79086 2 12M22 12C22 14.2091 17.5228 16 12 16C6.47715 16 2 14.2091 2 12M12 22C6.47715 22 2 17.5228 2 12M12 22C14.2091 22 16 17.5228 16 12C16 6.47715 14.2091 2 12 2M12 22C9.79086 22 8 17.5228 8 12C8 6.47715 9.79086 2 12 2M2 12C2 6.47715 6.47715 2 12 2"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
		</svg>
	);
}
