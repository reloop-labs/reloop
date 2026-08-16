import { HeroAnalyticsPreview } from "./hero-analytics-preview";
import { HeroDashboardShell } from "./hero-dashboard-shell";

export type HeroTabId = "analytics" | "dashboard" | "sdk" | "cloud" | "agents";

export function HeroPreview({ tab }: { tab: HeroTabId }) {
	return (
		<div className="flex h-full flex-col" aria-hidden>
			<HeroDashboardShell
				activeItem={
					tab === "agents"
						? "inbox"
						: tab === "cloud"
							? "domain"
							: tab === "sdk"
								? "api-keys"
								: "metrics"
				}
			>
				{tab === "sdk" ? (
					<SdkPanel />
				) : tab === "cloud" ? (
					<CloudPanel />
				) : tab === "agents" ? (
					<AgentsPanel />
				) : (
					<HeroAnalyticsPreview />
				)}
			</HeroDashboardShell>
		</div>
	);
}

function CloudPanel() {
	return (
		<div className="px-5 pt-6 sm:px-8 sm:pt-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
					All domains
				</h3>
				<div className="flex items-center gap-2">
					<span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-stroke-soft-200 px-2.5 text-[12px] text-text-soft-400 dark:border-white/10 dark:text-white/40">
						<SearchGlyph />
						Search domains
					</span>
					<span className="hidden h-8 items-center gap-1 rounded-lg border border-stroke-soft-200 px-2.5 text-[12px] text-text-sub-600 sm:inline-flex dark:border-white/10 dark:text-white/50">
						Sort by activity
						<CaretGlyph />
					</span>
					<span className="inline-flex h-8 items-center rounded-lg border border-stroke-soft-200 px-2.5 font-medium text-[12px] text-text-strong-950 dark:border-white/10 dark:text-white">
						Add domain
					</span>
				</div>
			</div>

			<div className="mt-6 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black">
				<div className="grid gap-0 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
					<div className="border-stroke-soft-200 border-b p-4 lg:border-r lg:border-b-0 dark:border-white/10">
						<EmailThumbnail />
					</div>
					<div className="p-5 sm:p-6">
						<div className="flex items-start justify-between gap-3">
							<h4 className="font-medium text-[16px] text-text-strong-950 dark:text-white">
								Ignite
							</h4>
							<span className="text-text-soft-400 dark:text-white/30">
								<svg viewBox="0 0 16 16" className="size-4" fill="none">
									<path
										d="M8 2.2 9.3 6h3.8l-3 2.2 1.1 3.7L8 9.8 4.8 11.9 5.9 8.2 2.9 6h3.8L8 2.2Z"
										stroke="currentColor"
										strokeWidth="1.2"
										strokeLinejoin="round"
									/>
								</svg>
							</span>
						</div>
						<div className="mt-4 grid grid-cols-2 gap-6">
							<Meta label="Sending" value="mail.acme.com" />
							<Meta label="Inbox" value="inbox.acme.com" />
						</div>
						<div className="mt-5 grid grid-cols-2 gap-6">
							<div>
								<p className="text-[12px] text-text-soft-400 dark:text-white/40">
									Status
								</p>
								<p className="mt-1 flex items-center gap-1.5 text-[13px] text-text-strong-950 dark:text-white">
									<span className="size-1.5 rounded-full bg-emerald-500" />
									Live
								</p>
							</div>
							<div>
								<p className="text-[12px] text-text-soft-400 dark:text-white/40">
									Created
								</p>
								<p className="mt-1 flex items-center gap-1.5 text-[13px] text-text-strong-950 dark:text-white">
									<span className="flex size-4 items-center justify-center rounded-full bg-amber-100 text-[8px] text-amber-900 dark:bg-amber-400/20 dark:text-amber-200">
										P
									</span>
									peterigh · 11d ago
								</p>
							</div>
						</div>
						<div className="mt-5">
							<p className="text-[12px] text-text-soft-400 dark:text-white/40">
								Latest activity
							</p>
							<p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-sub-600 dark:text-white/55">
								<span className="size-1.5 rounded-full bg-emerald-500" />
								<span className="font-medium text-text-strong-950 dark:text-white">
									main
								</span>
								<span className="font-mono text-[12px] text-text-soft-400">
									e3542b9
								</span>
								<span>feat: Welcome sequence (#267)</span>
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between border-stroke-soft-200 border-t px-5 py-3 dark:border-white/10">
					<span className="text-[12px] text-text-soft-400 dark:text-white/40">
						Domain details
					</span>
					<div className="flex items-center gap-2 text-text-soft-400 dark:text-white/35">
						<span className="size-3.5 rounded-[3px] border border-current" />
						<span className="size-3.5 rounded-full border border-current" />
						<span className="size-3.5 rounded-[3px] border border-current" />
					</div>
				</div>
			</div>
		</div>
	);
}

function SdkPanel() {
	return (
		<div className="p-5 sm:p-6">
			<div className="flex items-center gap-1.5">
				<span className="rounded-md bg-text-strong-950 px-2 py-1 font-medium text-[11px] text-white dark:bg-white dark:text-black">
					Node
				</span>
				<span className="rounded-md px-2 py-1 text-[11px] text-text-sub-600 dark:text-white/50">
					Python
				</span>
				<span className="rounded-md px-2 py-1 text-[11px] text-text-sub-600 dark:text-white/50">
					Go
				</span>
			</div>
			<pre className="mt-5 overflow-hidden font-mono text-[12px] text-text-sub-600 leading-6 dark:text-white/60">{`import Reloop from "@reloop/sdk";

const reloop = new Reloop({ apiKey });

await reloop.emails.send({
  from: "hello@mail.acme.com",
  to: user.email,
  template: "welcome",
});`}</pre>
			<div className="mt-6 rounded-lg border border-stroke-soft-200 px-3 py-2.5 text-[12px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
				<span className="mr-2 inline-block size-1.5 rounded-full bg-emerald-500" />
				Typed clients, same payload on REST and SMTP.
			</div>
		</div>
	);
}

function AgentsPanel() {
	return (
		<div className="grid h-full lg:grid-cols-[220px_minmax(0,1fr)]">
			<div className="hidden border-stroke-soft-200 border-r p-4 lg:block dark:border-white/10">
				<p className="px-2 font-medium text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/35">
					Inbox
				</p>
				<div className="mt-3 space-y-1">
					<InboxItem active from="Alex Smith" preview="Invoice charged twice" />
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

function EmailThumbnail() {
	return (
		<div className="overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black">
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3 py-2 dark:border-white/10">
				<div className="h-1.5 w-10 rounded-full bg-text-strong-950 dark:bg-white" />
				<div className="flex gap-1">
					<div className="h-1.5 w-6 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
					<div className="h-1.5 w-6 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
				</div>
			</div>
			<div className="bg-gradient-to-b from-bg-weak-50 to-bg-white-0 px-4 py-5 dark:from-white/[0.04] dark:to-black">
				<p className="font-medium text-[11px] text-text-strong-950 leading-tight tracking-tight dark:text-white">
					A new way to
					<br />
					send email
				</p>
				<div className="mt-3 space-y-1.5">
					<div className="h-1 w-full rounded-full bg-stroke-soft-200 dark:bg-white/12" />
					<div className="h-1 w-4/5 rounded-full bg-stroke-soft-200 dark:bg-white/12" />
				</div>
				<div className="mt-3 h-4 w-12 rounded-sm bg-text-strong-950 dark:bg-white" />
				<div className="mt-4 grid grid-cols-3 gap-1">
					<div className="h-8 rounded-sm bg-indigo-200/90 dark:bg-indigo-400/30" />
					<div className="h-8 rounded-sm bg-sky-200/90 dark:bg-sky-400/30" />
					<div className="h-8 rounded-sm bg-violet-200/80 dark:bg-violet-400/25" />
				</div>
			</div>
		</div>
	);
}

function Meta({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-[12px] text-text-soft-400 dark:text-white/40">
				{label}
			</p>
			<p className="mt-1 truncate text-[13px] text-text-strong-950 dark:text-white">
				{value}
			</p>
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

function SearchGlyph() {
	return (
		<svg viewBox="0 0 12 12" className="size-3" fill="none">
			<circle
				cx="5.2"
				cy="5.2"
				r="3.2"
				stroke="currentColor"
				strokeWidth="1.2"
			/>
			<path
				d="M7.6 7.6 10 10"
				stroke="currentColor"
				strokeWidth="1.2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function CaretGlyph() {
	return (
		<svg viewBox="0 0 12 12" className="size-2.5" fill="none">
			<path
				d="M3 4.5 6 7.5 9 4.5"
				stroke="currentColor"
				strokeWidth="1.4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
