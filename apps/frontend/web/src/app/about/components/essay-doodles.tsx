const sketch =
	"fill-none stroke-[1.3] [stroke-linecap:round] [stroke-linejoin:round]";

function SmtpSendDoodle({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 150 175"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<g className={sketch} stroke="currentColor">
				{/* envelope */}
				<path d="M14 22 L66 20 L64 58 L12 60 Z M14 22 L40 42 L66 20" />
				<path d="M16 66 h44 M16 72 h32" />
				{/* send arrow */}
				<path d="M72 40 h28 M92 32 l8 8 -8 8" strokeDasharray="3 4" />
				{/* server stack */}
				<path d="M104 18 L142 24 L138 132 L100 128 Z" />
				<path d="M104 18 L106 30 M142 24 L140 36 M102 28 L141 34" />
				<rect x="108" y="44" width="24" height="10" rx="2" />
				<rect x="108" y="60" width="24" height="10" rx="2" />
				<rect x="107" y="76" width="24" height="10" rx="2" />
				<circle cx="112" cy="49" r="1.6" fill="currentColor" />
				<circle cx="112" cy="65" r="1.6" fill="currentColor" />
				<circle cx="112" cy="81" r="1.6" fill="currentColor" />
				<path d="M118 49 h10 M118 65 h10 M117 81 h10" />
				{/* queue waves + 250 OK check */}
				<path d="M106 100 c 4 -3, 8 2, 12 0 M122 102 c 4 -3, 8 2, 10 0 M14 148 L80 144 M80 144 l-8 -4 M80 144 l-8 4" />
				<path d="M88 136 l6 6 10 -12" />
			</g>
		</svg>
	);
}

function ServerRackDoodle({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 72 292"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<g className={sketch} stroke="currentColor">
				{/* rack cabinet */}
				<path d="M12 8 L60 10 L56 274 L8 272 Z M12 8 L14 22 M60 10 L58 24 M10 20 L60 22" />
				{/* unit 1 */}
				<rect x="16" y="34" width="40" height="26" rx="2" />
				<circle cx="22" cy="42" r="2" fill="currentColor" />
				<circle cx="22" cy="50" r="1.5" />
				<path d="M30 42 h20 M30 48 h20 M30 54 h14" />
				{/* unit 2 */}
				<rect x="16" y="70" width="40" height="26" rx="2" />
				<circle cx="22" cy="78" r="2" fill="currentColor" />
				<path d="M30 78 h20 M30 84 h20 M30 90 h14" />
				{/* unit 3 */}
				<rect x="15" y="106" width="40" height="26" rx="2" />
				<circle cx="21" cy="114" r="2" fill="currentColor" />
				<path d="M29 114 h20 M29 120 h20 M29 126 h14" />
				{/* switch */}
				<path d="M18 148 l6 6 10 -12" />
				<path d="M16 162 h38 M16 170 h30" />
				{/* db cylinder */}
				<path d="M20 190 c 0 -5, 28 -5, 28 0 l-2 34 c 0 5, -24 5, -24 0 Z M20 190 c 0 5, 28 5, 28 0" />
				<path d="M22 206 c 6 3, 20 3, 24 0" />
				{/* cables */}
				<path d="M28 224 c -2 14, 10 12, 8 26 M40 224 c 4 12, -6 18, 2 30 M18 272 L54 273" />
				<path d="M50 240 l8 4 -4 8" />
			</g>
		</svg>
	);
}

function QueuePipelineDoodle({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 230 190"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<g className={sketch} stroke="currentColor">
				{/* API node */}
				<circle cx="22" cy="95" r="12" />
				<path d="M17 95 h10 M22 90 v10" />
				{/* queue box */}
				<path d="M48 78 L92 76 L90 114 L46 116 Z" />
				<path d="M54 88 h32 M54 96 h32 M54 104 h22" />
				{/* fan-out */}
				<path d="M92 86 C 120 84, 124 60, 150 58 M92 95 L132 95 M92 106 C 120 108, 124 132, 150 132" />
				{/* workers */}
				<rect x="150" y="46" width="30" height="24" rx="2" />
				<rect x="150" y="83" width="30" height="24" rx="2" />
				<rect x="150" y="120" width="30" height="24" rx="2" />
				<path d="M156 58 l5 5 8 -9 M156 95 l5 5 8 -9 M156 132 l5 5 8 -9" />
				{/* fan-in to inbox */}
				<path d="M180 58 C 196 60, 194 84, 208 88 M180 95 L208 94 M180 132 C 196 130, 194 102, 208 98" />
				<path d="M196 76 L220 74 L218 114 L194 116 Z M196 76 L207 94 L218 74" />
				<path d="M62 150 c 8 -4, 16 3, 24 0 M90 152 c 8 -4, 16 3, 24 0 M118 154 c 8 -4, 16 3, 24 0" />
			</g>
		</svg>
	);
}

function WebhookLogDoodle({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 230 140"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<g className={sketch} stroke="currentColor">
				{/* terminal / log back */}
				<path d="M8 10 L88 6 L86 78 L6 82 Z M10 20 L84 16" />
				<path d="M14 30 l8 4 -8 4 M28 34 h18 M14 44 l8 4 -8 4 M28 48 h14 M14 58 l8 4 -8 4 M28 62 h18" />
				{/* email card front */}
				<path d="M84 48 L218 60 L212 130 L78 122 Z" />
				<path d="M84 48 L84 60 M218 60 L217 72 M88 58 L214 68" />
				<circle cx="98" cy="64" r="2" fill="currentColor" />
				<circle cx="108" cy="65" r="2" fill="currentColor" />
				{/* envelope + lines */}
				<path d="M96 78 L142 76 L140 110 L94 110 Z M96 78 L118 92 L142 76" />
				<path d="M150 82 L198 84 M150 92 L198 94 M150 102 L192 104" />
				{/* webhook bolt */}
				<path d="M62 92 l12 -2 -4 8 10 -2 -6 12 -2 -8 -10 2 Z" />
			</g>
		</svg>
	);
}

export function EssayDoodles() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 text-neutral-400 dark:text-white/50"
		>
			<SmtpSendDoodle className="absolute top-28 right-6 hidden w-24 rotate-[8deg] opacity-60 md:block lg:right-10 lg:w-32 xl:right-14" />
			<ServerRackDoodle className="-rotate-[4deg] absolute top-[38%] left-6 hidden w-12 opacity-50 lg:left-10 lg:block lg:w-14 xl:left-14" />
			<QueuePipelineDoodle className="absolute top-[48%] right-4 hidden w-40 opacity-50 md:block lg:right-8 lg:w-52 xl:right-12 xl:w-60" />
			<WebhookLogDoodle className="absolute right-4 bottom-[14%] hidden w-40 rotate-[3deg] opacity-50 md:block lg:right-8 lg:w-52 xl:right-12 xl:w-60" />
		</div>
	);
}
