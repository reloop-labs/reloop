import { cn } from "@reloop/ui/cn";

export function NotFoundIllustration({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 58 58"
			className={cn(
				"size-20",
				"[--nf-base:#D1C9BB] [--nf-body:#E8E2D4] [--nf-track-dark:#A89878] [--nf-track-light:#EDE8E0]",
				"[--nf-screen-static:#FFFFFF] [--nf-screen:#2BA8D4]",
				"[--nf-cable:#525252] [--nf-connector:#737373]",
				"[--nf-port-blue:#1081E0] [--nf-port-green:#6DB544] [--nf-port-orange:#ED8A19] [--nf-port-red:#D75A4A]",
				"dark:[--nf-base:#363636] dark:[--nf-body:#2A2A2A] dark:[--nf-track-dark:#4A4A4A] dark:[--nf-track-light:#5C5C5C]",
				"dark:[--nf-screen-static:rgba(255,255,255,0.85)] dark:[--nf-screen:#1A4D6E]",
				"dark:[--nf-cable:#A3A3A3] dark:[--nf-connector:#8A8A8A]",
				"dark:[--nf-port-blue:#3B82F6] dark:[--nf-port-green:#4ADE80] dark:[--nf-port-orange:#FB923C] dark:[--nf-port-red:#F87171]",
				className,
			)}
			aria-hidden
		>
			<path
				fill="var(--nf-body)"
				d="M50.857,48H7.143C5.407,48,4,46.593,4,44.857V3.143C4,1.407,5.407,0,7.143,0h43.715
	C52.593,0,54,1.407,54,3.143v41.715C54,46.593,52.593,48,50.857,48z"
			/>
			<rect x="8" y="48" fill="var(--nf-base)" width="42" height="10" />
			<rect x="36" y="51" fill="var(--nf-track-dark)" width="11" height="4" />
			<rect x="43" y="51" fill="var(--nf-track-light)" width="4" height="4" />
			<path
				fill="var(--nf-screen)"
				d="M46.128,34H11.872C9.734,34,8,32.266,8,30.128V8.872C8,6.734,9.734,5,11.872,5h34.255
	C48.266,5,50,6.734,50,8.872v21.255C50,32.266,48.266,34,46.128,34z"
			/>
			<g fill="var(--nf-screen-static)">
				<path
					d="M13,15c0.256,0,0.512-0.098,0.707-0.293l4-4c0.391-0.391,0.391-1.023,0-1.414s-1.023-0.391-1.414,0
		l-4,4c-0.391,0.391-0.391,1.023,0,1.414C12.488,14.902,12.744,15,13,15z"
				/>
				<path
					d="M13,20c0.256,0,0.512-0.098,0.707-0.293l2-2c0.391-0.391,0.391-1.023,0-1.414s-1.023-0.391-1.414,0
		l-2,2c-0.391,0.391-0.391,1.023,0,1.414C12.488,19.902,12.744,20,13,20z"
				/>
				<path
					d="M16.29,14.29C16.11,14.48,16,14.74,16,15c0,0.26,0.11,0.52,0.29,0.71C16.48,15.89,16.74,16,17,16
		c0.26,0,0.52-0.11,0.71-0.29C17.89,15.52,18,15.27,18,15s-0.11-0.52-0.29-0.71C17.34,13.92,16.66,13.92,16.29,14.29z"
				/>
				<path
					d="M18.293,13.707C18.488,13.902,18.744,14,19,14s0.512-0.098,0.707-0.293l3-3
		c0.391-0.391,0.391-1.023,0-1.414s-1.023-0.391-1.414,0l-3,3C17.902,12.684,17.902,13.316,18.293,13.707z"
				/>
				<path
					d="M21.293,14.293l-9,9c-0.391,0.391-0.391,1.023,0,1.414C12.488,24.902,12.744,25,13,25
		s0.512-0.098,0.707-0.293l9-9c0.391-0.391,0.391-1.023,0-1.414S21.684,13.902,21.293,14.293z"
				/>
				<path
					d="M23.29,12.29C23.11,12.48,23,12.74,23,13c0,0.26,0.11,0.52,0.29,0.71C23.48,13.89,23.74,14,24,14
		c0.26,0,0.52-0.11,0.71-0.29C24.89,13.52,25,13.26,25,13c0-0.26-0.11-0.52-0.29-0.71C24.34,11.92,23.67,11.92,23.29,12.29z"
				/>
				<path
					d="M27.707,9.293c-0.391-0.391-1.023-0.391-1.414,0l-1,1c-0.391,0.391-0.391,1.023,0,1.414
		C25.488,11.902,25.744,12,26,12s0.512-0.098,0.707-0.293l1-1C28.098,10.316,28.098,9.684,27.707,9.293z"
				/>
			</g>
			<line
				fill="none"
				stroke="var(--nf-cable)"
				strokeWidth="2"
				strokeMiterlimit="10"
				x1="30"
				y1="41"
				x2="41"
				y2="41"
			/>
			<line
				fill="none"
				stroke="var(--nf-cable)"
				strokeWidth="2"
				strokeMiterlimit="10"
				x1="47"
				y1="41"
				x2="50"
				y2="41"
			/>
			<rect
				x="40"
				y="39"
				fill="var(--nf-connector)"
				stroke="var(--nf-cable)"
				strokeWidth="2"
				strokeMiterlimit="10"
				width="7"
				height="4"
			/>
			<rect
				x="9"
				y="43.987"
				fill="var(--nf-port-blue)"
				width="7"
				height="2.013"
			/>
			<rect
				x="9"
				y="41.987"
				fill="var(--nf-port-red)"
				width="7"
				height="2.013"
			/>
			<rect
				x="9"
				y="40"
				fill="var(--nf-port-orange)"
				width="7"
				height="2.013"
			/>
			<rect x="9" y="38" fill="var(--nf-port-green)" width="7" height="2.013" />
		</svg>
	);
}
