import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";

interface OrgSidebarPreviewProps {
	name: string;
	logo: string | null;
}

export function OrgSidebarPreview({ name, logo }: OrgSidebarPreviewProps) {
	const logoSrc = ensureAbsoluteUrl(logo);
	const initial =
		name && name.trim().length > 0 ? name.trim()[0]?.toUpperCase() : "O";

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

							{/* Section 1 Navigation Skeleton */}
							<div className="space-y-1.5">
								<div className="px-0.5 py-0.5">
									<div className={`h-2 w-8 rounded ${skeletonBg}`} />
								</div>
								<div className="flex items-center gap-2 px-1.5 py-1 text-text-soft-400">
									<Icon name="home" className="h-3 w-3 shrink-0 text-text-sub-600" />
									<div className={`h-2.5 w-16 rounded ${skeletonBg}`} />
								</div>
								<div className="flex items-center gap-2 px-1.5 py-1 text-text-soft-400">
									<div
										className={`h-3 w-3 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2.5 w-16 rounded ${skeletonBg}`} />
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
								<div className="flex items-center gap-2 px-0.5 py-0.5">
									<div
										className={`h-2.5 w-2.5 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2 w-16 rounded ${skeletonBg}`} />
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
								<div className="flex items-center gap-2 px-0.5 py-0.5">
									<div
										className={`h-2.5 w-2.5 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2 w-10 rounded ${skeletonBg}`} />
								</div>
							</div>
						</div>
					</div>

					{/* Right Content Area */}
					<div className="flex flex-1 flex-col overflow-hidden bg-bg-weak-50/20 dark:bg-bg-weak-50/5">
						{/* Top Header / Live Org Switcher */}
						<div className="flex items-center justify-between border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-2 dark:border-stroke-soft-100/40">
							{/* Live Org Switcher */}
							<div className="flex items-center gap-2 px-1 py-1">
								{name || logoSrc ? (
									<>
										{logoSrc ? (
											<img
												src={logoSrc}
												alt="Logo"
												className="h-5 w-5 shrink-0 rounded-md object-cover"
												referrerPolicy="no-referrer"
											/>
										) : (
											<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#ff6b2b] font-bold text-[11px] text-white">
												{initial}
											</span>
										)}
										<span className="max-w-[130px] truncate font-semibold text-text-strong-950 text-xs">
											{name}
										</span>
									</>
								) : (
									<>
										<div
											className={`h-5 w-5 shrink-0 rounded-md ${skeletonBg}`}
										/>
										<div className={`h-3.5 w-20 rounded-md ${skeletonBg}`} />
									</>
								)}
							</div>

							{/* Header Actions Skeleton */}
							<div className="flex items-center gap-2">
								<div className={`h-5 w-20 rounded-md ${skeletonBg}`} />
								<div className={`h-5 w-5 rounded-full ${skeletonBg}`} />
							</div>
						</div>

						{/* Main Content Dashboard Cards Skeleton */}
						<div className="flex-1 space-y-3.5 overflow-hidden p-4">
							{/* Page Heading Skeleton */}
							<div className="space-y-1.5">
								<div className={`h-2 w-10 rounded ${skeletonBg}`} />
								<div className={`h-4 w-44 rounded-md ${skeletonBg}`} />
							</div>

							{/* Row 1: Activity Card + Emails Card Skeleton */}
							<div className="grid grid-cols-5 gap-3">
								{/* Activity Card Skeleton */}
								<div className="col-span-3 space-y-2.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 dark:border-stroke-soft-100/40">
									<div className="flex items-center justify-between">
										<div className={`h-2.5 w-16 rounded ${skeletonBg}`} />
										<div className={`h-2.5 w-2.5 rounded ${skeletonBg}`} />
									</div>
									<div className="space-y-1">
										<div className={`h-2 w-28 rounded ${skeletonBg}`} />
										<div className={`h-1.5 w-20 rounded ${skeletonBg}`} />
									</div>
									<div
										className={`relative flex h-11 w-full items-end rounded-lg ${skeletonBg}`}
									/>
								</div>

								{/* Emails Card Skeleton */}
								<div className="col-span-2 flex flex-col justify-between rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 dark:border-stroke-soft-100/40">
									<div className="flex items-center justify-between">
										<div className={`h-2.5 w-14 rounded ${skeletonBg}`} />
										<div className={`h-2.5 w-2.5 rounded ${skeletonBg}`} />
									</div>
									<div className="flex flex-col items-center justify-center space-y-2 py-1 text-center">
										<div className={`h-4 w-4 rounded-full ${skeletonBg}`} />
										<div className={`h-2 w-20 rounded ${skeletonBg}`} />
										<div className={`h-4 w-16 rounded-md ${skeletonBg}`} />
									</div>
								</div>
							</div>

							{/* Row 2: Inboxes, Domains, Audit Logs Cards Skeleton */}
							<div className="grid grid-cols-3 gap-3">
								{/* Inboxes Card Skeleton */}
								<div className="space-y-2.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 text-center dark:border-stroke-soft-100/40">
									<div className="flex items-center justify-between">
										<div className={`h-2 w-16 rounded ${skeletonBg}`} />
										<div className={`h-2 w-2 rounded ${skeletonBg}`} />
									</div>
									<div className={`mx-auto h-2 w-20 rounded ${skeletonBg}`} />
									<div
										className={`mx-auto h-3.5 w-16 rounded-md ${skeletonBg}`}
									/>
								</div>

								{/* Domains Card Skeleton */}
								<div className="space-y-2.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 text-center dark:border-stroke-soft-100/40">
									<div className="flex items-center justify-between">
										<div className={`h-2 w-14 rounded ${skeletonBg}`} />
										<div className={`h-2 w-2 rounded ${skeletonBg}`} />
									</div>
									<div className={`mx-auto h-2 w-20 rounded ${skeletonBg}`} />
									<div
										className={`mx-auto h-3.5 w-16 rounded-md ${skeletonBg}`}
									/>
								</div>

								{/* Audit Logs Card Skeleton */}
								<div className="space-y-2.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 text-center dark:border-stroke-soft-100/40">
									<div className="flex items-center justify-between">
										<div className={`h-2 w-14 rounded ${skeletonBg}`} />
										<div className={`h-2.5 w-2.5 rounded ${skeletonBg}`} />
									</div>
									<div className={`mx-auto h-2 w-20 rounded ${skeletonBg}`} />
									<div
										className={`mx-auto h-3.5 w-16 rounded-md ${skeletonBg}`}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
