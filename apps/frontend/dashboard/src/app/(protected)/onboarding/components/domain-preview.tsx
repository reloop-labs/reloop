"use client";

import { Icon } from "@reloop/ui/icon";

interface DomainPreviewProps {
	domain?: string;
	logoUrl?: string;
	variant?: "onboarding" | "domain";
}

export const DomainPreview = ({
	domain,
	logoUrl,
	variant = "onboarding",
}: DomainPreviewProps) => {
	const domainName = domain ? domain.split(".")[0] || "Sender" : "Sender";
	const displayDomain = domain || "";
	const senderEmail = domain ? `hello@${domain}` : "";
	const toEmail = "sundar@google.com";
	const avatarInitial = domainName[0]?.toUpperCase() || "S";
	const isDomainVariant = variant === "domain";

	return (
		<div
			className={
				isDomainVariant
					? "absolute top-[176px] left-4"
					: "absolute top-32 left-28"
			}
		>
			<div
				className={
					isDomainVariant
						? "w-[920px] transform overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 transition-all dark:border-stroke-soft-100/40"
						: "relative flex h-[520px] w-[480px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 shadow-2xl dark:border-stroke-soft-100/40"
				}
				style={isDomainVariant ? { maxHeight: "calc(100% + 16px)" } : undefined}
			>
				{/* Browser Window Header */}
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
					<div className="flex gap-1.5">
						<div className="h-3 w-3 rounded-full bg-error-base/80" />
						<div className="h-3 w-3 rounded-full bg-warning-base/80" />
						<div className="h-3 w-3 rounded-full bg-success-base/80" />
					</div>
				</div>

				{/* Email Client Content */}
				<div
					className={
						isDomainVariant
							? "relative bg-bg-white-0 px-6 pt-5 pb-0"
							: "relative bg-bg-white-0 p-6"
					}
				>
					<div className="mb-5 flex items-start gap-4">
						{logoUrl ? (
							<img
								src={logoUrl}
								alt={domainName}
								className="h-10 w-10 shrink-0 rounded-full border-2 border-stroke-soft-100 object-cover"
							/>
						) : domain ? (
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-stroke-soft-100 bg-bg-soft-200 font-bold text-sm">
								{avatarInitial}
							</div>
						) : (
							<div className="h-10 w-10 rounded-full bg-bg-soft-200" />
						)}
						<div className="relative z-10 min-w-0 flex-1">
							{/* Sender Name & Email */}
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

							{/* Email Details Dropdown */}
							<div className="relative mt-2">
								<div
									className={
										isDomainVariant
											? "relative rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-3 text-text-sub-600 text-xs leading-relaxed shadow-stroke-soft-200/50 dark:border-stroke-soft-100/40"
											: "relative rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-4 text-text-sub-600 text-xs leading-relaxed shadow-stroke-soft-200/50 dark:border-stroke-soft-100/40"
									}
								>
									{/* Triangle Pointer */}
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
												<div
													className={
														isDomainVariant
															? "h-4 w-48 rounded bg-bg-weak-50"
															: "h-4 w-48 rounded bg-bg-soft-200"
													}
												/>
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

										{/* Verification Fields */}
										<div className="pr-3 text-right text-text-soft-400">
											mailed-by:
										</div>
										<div className="flex items-center gap-2">
											{domain ? (
												<span className="text-text-strong-950">
													{displayDomain}
												</span>
											) : (
												<div
													className={
														isDomainVariant
															? "h-4 w-32 rounded bg-bg-weak-50"
															: "h-4 w-32 rounded bg-bg-soft-200"
													}
												/>
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
												<div
													className={
														isDomainVariant
															? "h-4 w-32 rounded bg-bg-weak-50"
															: "h-4 w-32 rounded bg-bg-soft-200"
													}
												/>
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

					{/* Email Body Skeleton */}
					{!isDomainVariant && (
						<div className="mt-8 space-y-4 opacity-40 blur-[0.5px]">
							<div className="h-4 w-full rounded bg-bg-soft-200" />
							<div className="h-4 w-11/12 rounded bg-bg-soft-200" />
							<div className="h-4 w-4/5 rounded bg-bg-soft-200" />

							<div className="mt-8 flex h-40 w-full items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50 text-text-soft-400">
								<Icon name="info" />
							</div>

							<div className="mt-6 flex justify-center">
								<div className="h-10 w-32 rounded-lg bg-primary-lighter" />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
