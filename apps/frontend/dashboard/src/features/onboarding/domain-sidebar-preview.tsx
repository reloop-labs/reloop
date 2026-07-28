import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";

interface DomainSidebarPreviewProps {
	domain?: string;
	logo?: string | null;
}

export function DomainSidebarPreview({ domain, logo }: DomainSidebarPreviewProps) {
	const logoSrc = ensureAbsoluteUrl(logo);
	const displayDomain = domain && domain.trim().length > 0 ? domain : "example.com";
	const domainName = domain ? domain.split(".")[0] || "Sender" : "Sender";
	const initial = domainName[0]?.toUpperCase() || "D";

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
								{/* Active Domains Navigation Item */}
								<div className="flex items-center gap-2 rounded-lg bg-bg-weak-50 px-1.5 py-1 text-text-strong-950 dark:bg-bg-soft-200/40">
									<Icon name="globe" className="h-3 w-3 shrink-0 text-primary-base" />
									<div className="font-medium text-xs">Domains</div>
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

							{/* Section 3 Skeleton */}
							<div className="space-y-1.5 pt-0.5">
								<div className="px-0.5 py-0.5">
									<div className={`h-2 w-12 rounded ${skeletonBg}`} />
								</div>
								<div className="flex items-center gap-2 px-0.5 py-0.5">
									<div
										className={`h-2.5 w-2.5 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2 w-14 rounded ${skeletonBg}`} />
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
									Domain Settings
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className={`h-5 w-16 rounded-md ${skeletonBg}`} />
							</div>
						</div>

						{/* Main Content: Domain Details Card */}
						<div className="flex-1 space-y-3.5 overflow-hidden p-4">
							{/* Active Domain Card */}
							<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 shadow-sm dark:border-stroke-soft-100/40">
								<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-3 dark:border-stroke-soft-100/40">
									<div className="flex items-center gap-3">
										{logoSrc ? (
											<img
												src={logoSrc}
												alt="Domain Logo"
												className="h-8 w-8 shrink-0 rounded-full border border-stroke-soft-100 object-cover"
												referrerPolicy="no-referrer"
											/>
										) : (
											<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-lighter font-bold text-primary-base text-xs">
												{initial}
											</div>
										)}
										<div>
											<div className="font-semibold text-text-strong-950 text-xs">
												{displayDomain}
											</div>
											<div className="text-[10px] text-text-soft-400">
												hello@{displayDomain}
											</div>
										</div>
									</div>
									<span className="inline-flex items-center gap-1 rounded-full bg-warning-lighter px-2 py-0.5 font-medium text-[10px] text-warning-base">
										<span className="h-1.5 w-1.5 rounded-full bg-warning-base" />
										Pending DNS
									</span>
								</div>

								{/* DNS Records Status Skeletons */}
								<div className="mt-3 space-y-2">
									<div className="flex items-center justify-between rounded-lg bg-bg-weak-50 px-2.5 py-1.5 text-[11px] dark:bg-bg-soft-200/20">
										<div className="flex items-center gap-2">
											<span className="font-mono text-[10px] text-text-soft-400">DKIM</span>
											<span className="text-text-sub-600 text-xs">resend._domainkey</span>
										</div>
										<Icon name="check-circle" className="h-3.5 w-3.5 text-success-base" />
									</div>
									<div className="flex items-center justify-between rounded-lg bg-bg-weak-50 px-2.5 py-1.5 text-[11px] dark:bg-bg-soft-200/20">
										<div className="flex items-center gap-2">
											<span className="font-mono text-[10px] text-text-soft-400">SPF</span>
											<span className="text-text-sub-600 text-xs">v=spf1 include:reloop.sh</span>
										</div>
										<Icon name="check-circle" className="h-3.5 w-3.5 text-success-base" />
									</div>
									<div className="flex items-center justify-between rounded-lg bg-bg-weak-50 px-2.5 py-1.5 text-[11px] dark:bg-bg-soft-200/20">
										<div className="flex items-center gap-2">
											<span className="font-mono text-[10px] text-text-soft-400">DMARC</span>
											<span className="text-text-sub-600 text-xs">v=DMARC1; p=none</span>
										</div>
										<div className={`h-3.5 w-3.5 rounded-full ${skeletonBg}`} />
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
