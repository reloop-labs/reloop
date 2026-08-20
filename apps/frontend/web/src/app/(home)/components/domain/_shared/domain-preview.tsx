import { Icon } from "@reloop/ui/icon";

export function DomainPreview({
	domain,
	variant = "domain",
}: {
	domain?: string;
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
						{domain ? (
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
											Aug 16, 2026, 12:00 PM
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
