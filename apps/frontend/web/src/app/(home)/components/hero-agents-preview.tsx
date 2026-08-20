"use client";

export function HeroAgentsPreview() {
	return (
		<div className="grid h-full lg:grid-cols-[220px_minmax(0,1fr)]">
			<div className="hidden border-stroke-soft-200 border-r p-4 lg:block dark:border-white/10">
				<p className="px-2 font-medium text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/35">
					Inbox
				</p>
				<div className="mt-3 space-y-1">
					<InboxItem
						active
						from="Alex Smith"
						preview="Invoice charged twice"
					/>
					<InboxItem from="Maya Chen" preview="Can we move onboarding?" />
					<InboxItem from="Orbit" preview="Weekly usage report" />
				</div>
			</div>
			<div className="p-5 sm:p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
							Invoice charged twice
						</p>
						<p className="mt-0.5 text-[12px] text-text-soft-400 dark:text-white/40">
							alex@northwind.io · needs approval
						</p>
					</div>
					<span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-[11px] text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
						94%
					</span>
				</div>
				<div className="mt-5 rounded-xl border border-stroke-soft-200 p-4 dark:border-white/10">
					<p className="text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/35">
						Agent draft
					</p>
					<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
						Hi Alex — I found the duplicate charge on invoice #1024 and issued a
						$49 refund to the original card. It should land in 3–5 days.
					</p>
				</div>
				<div className="mt-4 flex gap-2">
					<span className="inline-flex h-8 items-center rounded-lg bg-text-strong-950 px-3 font-medium text-[12px] text-white dark:bg-white dark:text-black">
						Approve
					</span>
					<span className="inline-flex h-8 items-center rounded-lg border border-stroke-soft-200 px-3 text-[12px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
						Edit draft
					</span>
				</div>
			</div>
		</div>
	);
}

function InboxItem({
	from,
	preview,
	active,
}: {
	from: string;
	preview: string;
	active?: boolean;
}) {
	return (
		<div
			className={
				active
					? "rounded-lg bg-bg-weak-50 px-2.5 py-2 dark:bg-white/[0.05]"
					: "rounded-lg px-2.5 py-2"
			}
		>
			<p className="truncate font-medium text-[12px] text-text-strong-950 dark:text-white">
				{from}
			</p>
			<p className="truncate text-[11px] text-text-soft-400 dark:text-white/40">
				{preview}
			</p>
		</div>
	);
}
