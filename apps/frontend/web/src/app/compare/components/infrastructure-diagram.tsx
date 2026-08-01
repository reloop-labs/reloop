import { Logo } from "@reloop/ui/logo";

/* ─── arrow ─── */
function Arrow() {
	return (
		<svg
			width="28"
			height="10"
			viewBox="0 0 28 10"
			fill="none"
			className="mx-1 shrink-0 text-text-sub-600/30 dark:text-white/20"
			aria-hidden
		>
			<path
				d="M0 5h22m0 0-3-3m3 3-3 3"
				stroke="currentColor"
				strokeWidth="1.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

/* ─── node ─── */
function Node({
	label,
	sublabel,
	accent,
	children,
}: {
	label: string;
	sublabel?: string;
	accent?: boolean;
	children?: React.ReactNode;
}) {
	return (
		<div
			className={[
				"flex items-center justify-center gap-2 rounded-full px-5 py-2.5",
				accent
					? "bg-bg-weak-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_0_1px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.06)] dark:bg-[#1c1f26] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.3)]"
					: "bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.05)] dark:bg-[#141619] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(255,255,255,0.06),0_1px_4px_rgba(0,0,0,0.2)]",
			].join(" ")}
		>
			{children}
			<div className="flex flex-col items-center gap-0">
				<span className="whitespace-nowrap font-medium text-[13px] text-text-strong-950 dark:text-white/85">
					{label}
				</span>
				{sublabel ? (
					<span className="whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/35">
						{sublabel}
					</span>
				) : null}
			</div>
		</div>
	);
}

/* ─── main ─── */
export function InfrastructureDiagram() {
	return (
		<figure
			className="relative mx-auto flex max-w-4xl flex-col items-center gap-10 overflow-hidden rounded-3xl px-8 py-12 sm:px-12 sm:py-14"
			role="img"
			aria-label="Diagram comparing Reloop direct KumoMTA delivery path to Resend path through Amazon SES"
		>
			{/* ── Reloop row ── */}
			<div className="relative flex flex-col items-center gap-4">
				<h3 className="font-medium text-[14px] text-text-strong-950 sm:text-[15px] dark:text-white/90">
					Reloop: own MTA
				</h3>
				<div className="flex items-center gap-1">
					<Node label="Your app" />
					<Arrow />
					<Node label="API / SMTP" />
					<Arrow />
					<Node label="Reloop" sublabel="Queue + KumoMTA" accent>
						<span className="flex size-5 items-center justify-center">
							<Logo className="size-full text-text-strong-950 dark:text-white/70" />
						</span>
					</Node>
					<Arrow />
					<Node label="Recipient inbox" />
				</div>
				<p className="text-[11px] text-text-sub-600/60 sm:text-[12px] dark:text-white/30">
					One provider. Full control over every hop.
				</p>
			</div>

			{/* divider */}
			<div
				className="h-px w-2/3 bg-black/[0.06] dark:bg-white/[0.06]"
				aria-hidden
			/>

			{/* ── Resend row ── */}
			<div className="relative flex flex-col items-center gap-4">
				<h3 className="font-medium text-[14px] text-text-strong-950 sm:text-[15px] dark:text-white/90">
					Resend: routed through Amazon SES
				</h3>
				<div className="flex items-center gap-1">
					<Node label="Your app" />
					<Arrow />
					<Node label="API / SMTP" />
					<Arrow />
					<Node label="Resend" sublabel="Queue" />
					<Arrow />
					<Node label="Amazon SES" sublabel="Queue + MTA" accent />
					<Arrow />
					<Node label="Recipient inbox" />
				</div>
				<p className="text-[11px] text-text-sub-600/60 sm:text-[12px] dark:text-white/30">
					Two providers. An extra hop and less control.
				</p>
			</div>

			<figcaption className="relative text-[11px] text-text-sub-600/40 sm:text-[12px] dark:text-white/20">
				Architectural difference based on public Resend delivery path (Amazon
				SES) and Reloop&apos;s KumoMTA stack—not a latency benchmark.
			</figcaption>
		</figure>
	);
}
