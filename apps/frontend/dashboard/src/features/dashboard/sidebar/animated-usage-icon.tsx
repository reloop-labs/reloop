import { cn } from "@reloop/ui/cn";

type AnimatedUsageIconProps = {
	className?: string;
};

/**
 * Usage doughnut (original icon): segments draw outward on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedUsageIcon({ className }: AnimatedUsageIconProps) {
	return (
		<svg
			viewBox="0 0 2253 2253"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			<path
				d="M1147.83,208.333c-517.767,0 -937.5,419.733 -937.5,937.5c-0,428.307 290.274,802.155 705.228,908.271l116.136,-454.135c-207.477,-53.058 -352.614,-239.982 -352.614,-454.136c-0,-258.883 209.866,-468.75 468.75,-468.75l-0,-468.75Z"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="180"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-usage-spoke-1"
			/>
			<path
				d="M1997.49,749.576c-153.977,-330.174 -485.321,-541.243 -849.663,-541.243l-0,468.704c182.171,0 347.843,105.535 424.832,270.622l424.831,-198.083Z"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="180"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-usage-spoke-2"
			/>
			<path
				d="M905.188,2051.39c500.124,134.008 1014.19,-162.788 1148.2,-662.913c64.353,-240.168 30.664,-496.064 -93.656,-711.393l-405.95,234.375c62.16,107.665 79.005,235.613 46.828,355.697c-67.003,250.062 -324.036,398.46 -574.099,331.456l-121.321,452.778Z"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="180"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-usage-spoke-3"
			/>
		</svg>
	);
}
