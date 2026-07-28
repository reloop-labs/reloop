import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";

interface DnsSidebarPreviewProps {
	domain?: string;
}

export function DnsSidebarPreview({ domain }: DnsSidebarPreviewProps) {
	const displayDomain = domain && domain.trim().length > 0 ? domain : "example.com";
	const skeletonBg = "bg-bg-weak-50 dark:bg-bg-soft-200/30";

	return (
		<div className="flex h-full w-full items-center justify-center p-4 sm:p-6">
			<div className="relative flex h-[460px] w-full max-w-[640px] scale-110 flex-col overflow-hidden rounded-2xl [mask-image:linear-gradient(135deg,black_40%,transparent_92%)] sm:h-[480px]">
				{/* Main Body */}
				<div className="flex flex-1 overflow-hidden">
					{/* Left Sidebar */}
					<div className="flex w-44 shrink-0 flex-col border-stroke-soft-100 border-r bg-bg-white-0 p-3.5 text-[11px] dark:border-stroke-soft-100/40">
						<div className="space-y-3.5 overflow-y-auto">
							{/* Reloop Brand Logo */}
							<div className="flex shrink-0 items-center gap-1.5 px-0.5 py-0.5">
								<Logo className="h-5 w-5 shrink-0" />
								<span className="font-semibold text-text-strong-950 text-xs leading-none">
									Reloop
								</span>
								<span
									className={`rounded ${skeletonBg} px-1.5 py-0.5 font-medium font-mono text-[9px] text-text-soft-400 leading-none`}
								>
									BETA
								</span>
							</div>

							{/* Section 1 Navigation */}
							<div className="space-y-1.5">
								<div className="px-0.5 py-0.5">
									<div className={`h-2 w-8 rounded ${skeletonBg}`} />
								</div>
								<div className="flex items-center gap-2 px-1.5 py-1 text-text-soft-400">
									<div
										className={`h-3 w-3 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2.5 w-16 rounded ${skeletonBg}`} />
								</div>
								{/* Active DNS Settings Navigation Item */}
								<div className="flex items-center gap-2 rounded-lg bg-bg-weak-50 px-1.5 py-1 text-text-strong-950 dark:bg-bg-soft-200/40">
									<Icon name="shield-check" className="h-3 w-3 shrink-0 text-primary-base" />
									<div className="font-medium text-xs">DNS Records</div>
								</div>
							</div>

							{/* Section 2 Skeleton */}
							<div className="space-y-1.5 pt-0.5">
								<div className="px-0.5 py-0.5">
									<div className={`h-2 w-10 rounded ${skeletonBg}`} />
								</div>
								<div className="flex items-center gap-2 px-0.5 py-0.5">
									<div
										className={`h-2.5 w-2.5 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2 w-14 rounded ${skeletonBg}`} />
								</div>
								<div className="flex items-center gap-2 px-0.5 py-0.5">
									<div
										className={`h-2.5 w-2.5 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2 w-12 rounded ${skeletonBg}`} />
								</div>
							</div>
						</div>
					</div>

					{/* Right Content Area */}
					<div className="flex flex-1 flex-col overflow-hidden bg-bg-weak-50/20 dark:bg-bg-weak-50/5">
						{/* Top Header */}
						<div className="flex items-center justify-between border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-2 dark:border-stroke-soft-100/40">
							<div className="flex items-center gap-2">
								<span className="font-semibold text-text-strong-950 text-xs">
									DNS Records Configuration
								</span>
							</div>
							<span className="inline-flex items-center gap-1 rounded-full bg-success-lighter px-2 py-0.5 font-medium text-[10px] text-success-base">
								<Icon name="check-circle" className="h-3 w-3" />
								Verified
							</span>
						</div>

						{/* Main Content: DNS Records Cards */}
						<div className="flex-1 space-y-3 overflow-hidden p-3.5">
							{/* Status Header */}
							<div className="flex items-center justify-between rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 shadow-sm dark:border-stroke-soft-100/40">
								<div>
									<div className="font-semibold text-text-strong-950 text-xs">
										{displayDomain}
									</div>
									<div className="text-[10px] text-text-soft-400">
										4 of 4 DNS records active
									</div>
								</div>
								<div className="h-2 w-24 overflow-hidden rounded-full bg-bg-weak-50">
									<div className="h-full w-full rounded-full bg-success-base" />
								</div>
							</div>

							{/* DNS Records Table */}
							<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 shadow-sm dark:border-stroke-soft-100/40">
								<div className="mb-2 font-medium text-[10px] text-text-soft-400 uppercase tracking-wider">
									Configured Records
								</div>
								<div className="space-y-2 text-[11px]">
									<div className="flex items-center justify-between rounded-lg bg-bg-weak-50 p-2 dark:bg-bg-soft-200/20">
										<div className="flex items-center gap-2">
											<span className="rounded bg-bg-soft-200 px-1 py-0.5 font-mono text-[9px] text-text-strong-950">
												TXT
											</span>
											<span className="font-medium text-text-sub-600 text-xs">
												resend._domainkey
											</span>
										</div>
										<Icon name="check-circle" className="h-3.5 w-3.5 text-success-base" />
									</div>

									<div className="flex items-center justify-between rounded-lg bg-bg-weak-50 p-2 dark:bg-bg-soft-200/20">
										<div className="flex items-center gap-2">
											<span className="rounded bg-bg-soft-200 px-1 py-0.5 font-mono text-[9px] text-text-strong-950">
												TXT
											</span>
											<span className="font-medium text-text-sub-600 text-xs">
												v=spf1 include:reloop.sh
											</span>
										</div>
										<Icon name="check-circle" className="h-3.5 w-3.5 text-success-base" />
									</div>

									<div className="flex items-center justify-between rounded-lg bg-bg-weak-50 p-2 dark:bg-bg-soft-200/20">
										<div className="flex items-center gap-2">
											<span className="rounded bg-bg-soft-200 px-1 py-0.5 font-mono text-[9px] text-text-strong-950">
												MX
											</span>
											<span className="font-medium text-text-sub-600 text-xs">
												feedback-smtp.reloop.sh
											</span>
										</div>
										<Icon name="check-circle" className="h-3.5 w-3.5 text-success-base" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
