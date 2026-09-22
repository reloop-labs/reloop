import { cn } from "@reloop/ui/cn";

/**
 * Blueprint-style timer mark for the temp-email-checker hero.
 * Same visual language as the OG image / CTA drafting art:
 * grid guides, construction circles, dimension bars, anchor nodes.
 * Strokes use currentColor so it picks up `text-primary-base`.
 * Static on purpose — no animation.
 */
export function TempEmailTimerArt({
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
				{/* faint grid */}
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
				{/* topper button */}
				<rect
					x="196"
					y="52"
					width="28"
					height="12"
					rx="3"
					stroke="currentColor"
					strokeWidth="3"
				/>
				<line
					x1="210"
					y1="64"
					x2="210"
					y2="78"
					stroke="currentColor"
					strokeWidth="3"
				/>
				{/* clock face */}
				<circle
					cx="210"
					cy="170"
					r="92"
					stroke="currentColor"
					strokeWidth="4"
					fill="currentColor"
					fillOpacity="0.04"
				/>
				{/* 12 tick marks */}
				<g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
					<line x1="210" y1="86" x2="210" y2="98" />
					<line x1="252" y1="97" x2="246" y2="107" />
					<line x1="282" y1="128" x2="272" y2="134" />
					<line x1="294" y1="170" x2="282" y2="170" />
					<line x1="282" y1="212" x2="272" y2="206" />
					<line x1="252" y1="243" x2="246" y2="233" />
					<line x1="210" y1="254" x2="210" y2="242" />
					<line x1="168" y1="243" x2="174" y2="233" />
					<line x1="138" y1="212" x2="148" y2="206" />
					<line x1="126" y1="170" x2="138" y2="170" />
					<line x1="138" y1="128" x2="148" y2="134" />
					<line x1="168" y1="97" x2="174" y2="107" />
				</g>
				{/* hands */}
				<line
					x1="210"
					y1="170"
					x2="210"
					y2="112"
					stroke="currentColor"
					strokeWidth="5"
					strokeLinecap="round"
				/>
				<line
					x1="210"
					y1="170"
					x2="252"
					y2="190"
					stroke="currentColor"
					strokeWidth="5"
					strokeLinecap="round"
				/>
				<circle cx="210" cy="170" r="7" fill="currentColor" />
				{/* dimension bars */}
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
				{/* CAD anchor nodes */}
				<g fill="currentColor">
					<rect x="204" y="72" width="12" height="12" rx="2" />
					<rect x="296" y="164" width="12" height="12" rx="2" />
					<rect x="204" y="256" width="12" height="12" rx="2" />
					<rect x="112" y="164" width="12" height="12" rx="2" />
					<rect x="204" y="164" width="12" height="12" rx="2" />
				</g>
			</svg>
		</div>
	);
}
