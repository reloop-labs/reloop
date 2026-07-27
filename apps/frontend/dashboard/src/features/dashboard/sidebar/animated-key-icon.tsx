import { cn } from "@reloop/ui/cn";

type AnimatedKeyIconProps = {
	className?: string;
};

/**
 * Original key shape; bow stays put, bit bobs once around the bow center.
 * Place inside an element with the `group` class.
 */
export function AnimatedKeyIcon({ className }: AnimatedKeyIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0 overflow-visible", className)}
		>
			<g
				className="motion-safe:group-hover:animate-key-bit-bob"
				style={{
					transformOrigin: "16.5px 7.5px",
					transformBox: "view-box",
				}}
			>
				<path
					d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle cx={16.5} cy={7.5} r={0.5} fill="currentColor" />
			</g>
		</svg>
	);
}
