import { cn } from "@reloop/ui/cn";

/**
 * Blueprint-style terminal window for the API card.
 * Same canvas, grid, guides, and stroke scale as TempEmailTimerArt
 * (420x340, frame stroke 4, mark stroke 5, detail stroke 3/2)
 * so all cards render equally crisp at h-32.
 * Static on purpose — no animation.
 */
export function ApiBlueprintArt({
	className,
	flip = false,
}: {
	className?: string;
	flip?: boolean;
}) {
	return (
		<div
			className={cn("pointer-events-none select-none", className)}
			style={flip ? { transform: "scaleX(-1)" } : undefined}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 420 340"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="h-full w-auto"
			>
				{/* faint grid — identical to timer art */}
				<g stroke="currentColor" strokeWidth="1" opacity="0.18">
					<line x1="10" y1="20" x2="10" y2="320" />
					<line x1="50" y1="20" x2="50" y2="320" />
					<line x1="90" y1="20" x2="90" y2="320" />
					<line x1="130" y1="20" x2="130" y2="320" />
					<line x1="170" y1="20" x2="170" y2="320" />
					<line x1="250" y1="20" x2="250" y2="320" />
					<line x1="290" y1="20" x2="290" y2="320" />
					<line x1="330" y1="20" x2="330" y2="320" />
					<line x1="370" y1="20" x2="370" y2="320" />
					<line x1="410" y1="20" x2="410" y2="320" />
					<line x1="0" y1="50" x2="420" y2="50" />
					<line x1="0" y1="90" x2="420" y2="90" />
					<line x1="0" y1="130" x2="420" y2="130" />
					<line x1="0" y1="210" x2="420" y2="210" />
					<line x1="0" y1="250" x2="420" y2="250" />
					<line x1="0" y1="290" x2="420" y2="290" />
				</g>
				{/* dotted drafting guides */}
				<g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.25">
					<circle cx="210" cy="170" r="140" strokeDasharray="3 4" />
					<circle cx="210" cy="170" r="48" strokeDasharray="2 3" />
				</g>
				{/* diagonal construction rays */}
				<g stroke="currentColor" strokeWidth="1" opacity="0.14">
					<line x1="60" y1="20" x2="360" y2="320" />
					<line x1="360" y1="20" x2="60" y2="320" />
				</g>
				{/* center axes */}
				<g
					stroke="currentColor"
					strokeWidth="1"
					strokeDasharray="6 4"
					opacity="0.35"
				>
					<line x1="210" y1="8" x2="210" y2="312" />
					<line x1="16" y1="170" x2="404" y2="170" />
				</g>
				{/* construction circles */}
				<circle
					cx="210"
					cy="170"
					r="125"
					stroke="currentColor"
					strokeWidth="1"
					opacity="0.25"
				/>
				<circle
					cx="210"
					cy="170"
					r="70"
					stroke="currentColor"
					strokeWidth="1"
					strokeDasharray="4 4"
					opacity="0.25"
				/>
				{/* bounding squircle — rounded dashed frame, like the CTA blueprint */}
				<rect
					x="16"
					y="24"
					width="388"
					height="292"
					rx="28"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					strokeDasharray="6 5"
					opacity="0.25"
				/>
				{/* CAD intersection ticks */}
				<g opacity="0.35" stroke="currentColor" strokeWidth="1">
					<path d="M 12 24 H 20 M 16 20 V 28" />
					<path d="M 400 24 H 408 M 404 20 V 28" />
					<path d="M 12 316 H 20 M 16 312 V 320" />
					<path d="M 400 316 H 408 M 404 312 V 320" />
					<path d="M 206 24 H 214 M 210 20 V 28" />
					<path d="M 206 316 H 214 M 210 312 V 320" />
					<path d="M 12 170 H 20 M 16 166 V 174" />
					<path d="M 400 170 H 408 M 404 166 V 174" />
				</g>
				{/* terminal frame — centered on (210,170) */}
				<rect
					x="110"
					y="88"
					width="200"
					height="164"
					rx="20"
					stroke="currentColor"
					strokeWidth="4"
					fill="currentColor"
					fillOpacity="0.04"
				/>
				{/* titlebar divider */}
				<line
					x1="110"
					y1="124"
					x2="310"
					y2="124"
					stroke="currentColor"
					strokeWidth="2"
				/>
				{/* traffic dots */}
				<g fill="currentColor">
					<circle cx="134" cy="106" r="6" />
					<circle cx="154" cy="106" r="6" opacity="0.45" />
				</g>
				{/* prompt chevron + cursor — same weight as the timer hands */}
				<path
					d="M 138 150 L 156 166 L 138 182"
					stroke="currentColor"
					strokeWidth="5"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
				<line
					x1="166"
					y1="182"
					x2="192"
					y2="182"
					stroke="currentColor"
					strokeWidth="5"
					strokeLinecap="round"
				/>
				{/* output line — same weight as the timer tick marks */}
				<line
					x1="138"
					y1="206"
					x2="244"
					y2="206"
					stroke="currentColor"
					strokeWidth="3"
					strokeLinecap="round"
					opacity="0.6"
				/>
				{/* dimension bars — identical to timer art */}
				<g opacity="0.6">
					<line
						x1="118"
						y1="40"
						x2="168"
						y2="40"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<line
						x1="252"
						y1="40"
						x2="302"
						y2="40"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<path
						d="M 118 35 V 45 M 302 35 V 45"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<line
						x1="330"
						y1="78"
						x2="330"
						y2="114"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<line
						x1="330"
						y1="216"
						x2="330"
						y2="262"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<path
						d="M 325 78 H 335 M 325 262 H 335"
						stroke="currentColor"
						strokeWidth="1"
					/>
				</g>
			</svg>
		</div>
	);
}
