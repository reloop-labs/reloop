import { Icon } from "@reloop/ui/icon";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";

export function DomainPreview({
	domain,
	logoUrl,
	variant = "domain",
}: {
	domain?: string;
	logoUrl?: string;
	variant?: "onboarding" | "domain";
}) {
	const domainName = domain ? domain.split(".")[0] || "Sender" : "Sender";
	const displayDomain = domain || "";
	const senderEmail = domain ? `hello@${domain}` : "";
	const toEmail = "sundar@google.com";
	const avatarInitial = domainName[0]?.toUpperCase() || "S";
	const isDomainVariant = variant === "domain";
	const skeletonClass = isDomainVariant
		? "h-4 rounded bg-bg-weak-50"
		: "h-4 rounded bg-bg-soft-200";
	const logoSrc = ensureAbsoluteUrl(logoUrl);

	return (
		<div
			className={
				isDomainVariant ? "absolute top-24 left-4" : "absolute top-24 left-8"
			}
		>
			<div
				className={
					isDomainVariant
						? "w-[920px] transform overflow-hidden transition-all"
						: "relative flex h-[520px] w-[480px] flex-col overflow-hidden"
				}
				style={isDomainVariant ? { maxHeight: "calc(100% + 16px)" } : undefined}
			>
				<div
					className={
						isDomainVariant ? "relative px-6 pt-5 pb-0" : "relative p-6"
					}
				>
					<div className="mb-5 flex items-start gap-4">
						{logoSrc ? (
							<img
								src={logoSrc}
								alt={domainName}
								className="h-10 w-10 shrink-0 rounded-full border-2 border-stroke-soft-100 object-cover"
								referrerPolicy="no-referrer"
							/>
						) : domain ? (
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-stroke-soft-100 bg-bg-soft-200 font-bold text-sm">
								{avatarInitial}
							</div>
						) : (
							<div className="h-10 w-10 rounded-full bg-bg-soft-200" />
						)}
						<div className="relative z-10 min-w-0 flex-1">
							<div className="mb-1 flex items-center gap-2">
								{domain ? (
									<>
										<span className="font-bold text-sm text-text-strong-950">
											{domainName}
										</span>
										<span className="hidden text-text-soft-400 text-xs sm:inline">
											&lt;{senderEmail}&gt;
										</span>
									</>
								) : (
									<div className="mb-1 h-4 w-32 rounded bg-bg-soft-200" />
								)}
								<span className="ml-auto cursor-pointer text-primary-base text-xs sm:ml-2">
									Unsubscribe
								</span>
							</div>

							{!isDomainVariant && (
								<div className="mb-2 flex cursor-pointer items-center gap-1 text-text-soft-400 text-xs">
									to me{" "}
									<div className="mt-0.5 h-0 w-0 border-t-[4px] border-t-text-soft-400 border-r-[3px] border-r-transparent border-l-[3px] border-l-transparent" />
								</div>
							)}

							<div className="relative mt-2">
								<div
									className={
										isDomainVariant
											? "relative rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-3 text-text-sub-600 text-xs leading-relaxed shadow-stroke-soft-200/50 dark:border-stroke-soft-100/40"
											: "relative rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-4 text-text-sub-600 text-xs leading-relaxed shadow-stroke-soft-200/50 dark:border-stroke-soft-100/40"
									}
								>
									<div className="-top-1.5 absolute left-3 h-3 w-3 rotate-45 transform border-stroke-soft-100 border-t border-l bg-bg-white-0 dark:border-stroke-soft-100/40" />

									<div
										className={
											isDomainVariant
												? "grid grid-cols-[100px_1fr] gap-y-2"
												: "grid grid-cols-[100px_1fr] gap-y-2.5"
										}
									>
										<div className="pr-3 text-right text-text-soft-400">
											from:
										</div>
										<div className="font-medium text-text-strong-950">
											{domain ? (
												<>
													{domainName}{" "}
													<span className="font-normal text-text-sub-600">
														&lt;{senderEmail}&gt;
													</span>
												</>
											) : (
												<div className={`${skeletonClass} w-48`} />
											)}
										</div>

										<div className="pr-3 text-right text-text-soft-400">
											to:
										</div>
										<div className="text-text-strong-950">{toEmail}</div>

										<div className="pr-3 text-right text-text-soft-400">
											date:
										</div>
										<div className="text-text-sub-600">
											{new Date().toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
											,{" "}
											{new Date().toLocaleTimeString("en-US", {
												hour: "numeric",
												minute: "2-digit",
												hour12: true,
											})}
										</div>

										<div className="pr-3 text-right text-text-soft-400">
											mailed-by:
										</div>
										<div className="flex items-center gap-2">
											{domain ? (
												<span className="text-text-strong-950">
													{displayDomain}
												</span>
											) : (
												<div className={`${skeletonClass} w-32`} />
											)}
										</div>

										<div className="pr-3 text-right text-text-soft-400">
											signed-by:
										</div>
										<div className="flex items-center gap-2">
											{domain ? (
												<span className="text-text-strong-950">
													{displayDomain}
												</span>
											) : (
												<div className={`${skeletonClass} w-32`} />
											)}
										</div>

										<div className="pr-3 text-right text-text-soft-400">
											security:
										</div>
										<div className="flex items-center gap-1.5 text-text-sub-600">
											<Icon
												name="shield-check"
												className="h-3 w-3 text-text-soft-400"
											/>
											<span>Standard encryption (TLS)</span>
										</div>
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
