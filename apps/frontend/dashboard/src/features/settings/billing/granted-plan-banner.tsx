import { Icon } from "@reloop/ui/icon";

function formatGrantedDate(value: string): string {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Shown when a Reloop admin upgraded the organization's plan. */
export function GrantedPlanBanner({
	planName,
	grantedAt,
}: {
	planName: string;
	grantedAt: string;
}) {
	return (
		<div className="relative overflow-hidden rounded-2xl bg-neutral-950 p-4 text-white shadow-regular-xs ring-1 ring-black/5 dark:ring-white/10">
			{/* Soft celebratory glow, kept behind the content */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_140%_at_0%_0%,rgba(251,191,36,0.32),transparent_60%),radial-gradient(60%_140%_at_100%_0%,rgba(236,72,153,0.26),transparent_60%),radial-gradient(80%_120%_at_60%_130%,rgba(139,92,246,0.34),transparent_60%)]"
			/>
			<div className="relative flex items-start gap-3">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
					<Icon name="gift" className="h-4 w-4 text-white" />
				</span>
				<div className="min-w-0 pt-px">
					<p className="font-semibold text-paragraph-sm text-white">
						You&apos;ve been upgraded to the {planName} plan 🎉
					</p>
					<p className="mt-0.5 text-paragraph-xs text-white/70">
						The Reloop team upgraded this organization on{" "}
						{formatGrantedDate(grantedAt)}. Enjoy the higher limits.
					</p>
				</div>
			</div>
		</div>
	);
}
