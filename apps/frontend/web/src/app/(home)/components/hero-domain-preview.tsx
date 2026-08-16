"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKey } from "@reloop/ui/kbd-key";

type DomainStatus = "pending" | "verifying" | "active" | "suspended" | "failed";

const DOMAINS: {
	id: string;
	domain: string;
	status: DomainStatus;
	time: string;
}[] = [
	{ id: "dom_01", domain: "acme.com", status: "active", time: "11 days ago" },
	{
		id: "dom_02",
		domain: "mail.acme.com",
		status: "active",
		time: "11 days ago",
	},
	{
		id: "dom_03",
		domain: "updates.acme.com",
		status: "verifying",
		time: "2 days ago",
	},
	{
		id: "dom_04",
		domain: "inbox.acme.com",
		status: "active",
		time: "8 days ago",
	},
	{
		id: "dom_05",
		domain: "staging.acme.com",
		status: "pending",
		time: "1 day ago",
	},
	{
		id: "dom_06",
		domain: "track.acme.com",
		status: "failed",
		time: "3 days ago",
	},
];

const domainGridStyle = {
	gridTemplateColumns: "32px minmax(0,1fr) 120px 140px 32px",
};

const toolbarControlClassName = cn(
	"inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 shadow-none",
	"font-normal text-text-sub-600 text-xs transition duration-200 ease-out",
	"hover:bg-bg-weak-50 hover:text-text-strong-950",
	"dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40",
);

const kbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

const resourceCardClassName = cn(
	"group flex w-full cursor-pointer flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left",
	"transition-[border-color,background-color,transform] duration-150 ease-out",
	"hover:border-stroke-soft-200 hover:bg-bg-weak-50/50",
	"active:scale-[0.99]",
	"dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20 dark:hover:bg-bg-weak-50/40",
);

function ActionKbd({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<KbdKey className={cn(kbdClassName, className)}>{children}</KbdKey>
	);
}

function getStatusLabel(status: DomainStatus): string {
	switch (status) {
		case "active":
			return "Active";
		case "verifying":
			return "Verifying";
		case "pending":
			return "Not Started";
		case "suspended":
			return "Suspended";
		case "failed":
			return "Failed";
		default:
			return status;
	}
}

function getStatusColorClass(status: DomainStatus): string {
	switch (status) {
		case "pending":
			return "text-text-sub-600";
		case "verifying":
			return "text-warning-base";
		case "active":
			return "text-success-base";
		case "failed":
		case "suspended":
			return "text-error-base";
		default:
			return "text-text-sub-600";
	}
}

function getStatusIcon(status: DomainStatus): string {
	switch (status) {
		case "pending":
			return "minus-circle";
		case "verifying":
			return "time";
		case "active":
			return "check-circle";
		case "failed":
			return "cross-circle";
		default:
			return "minus-circle";
	}
}

export function HeroDomainPreview() {
	return (
		<div className="h-full overflow-hidden bg-bg-white-0 dark:bg-black">
			<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
				<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<div className="flex items-center gap-2.5">
							<Icon
								name="globe"
								className="h-6 w-6 shrink-0 text-text-strong-950"
							/>
							<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								Domains
							</h1>
						</div>
						<p className="mt-1 text-sm text-text-sub-600">
							Add and verify custom domains to send emails with maximum
							deliverability.
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							tabIndex={-1}
							className="gap-1.5 rounded-xl text-text-strong-950"
						>
							<Icon name="code" className="h-4 w-4 text-text-sub-600" />
							SDK
							<ActionKbd>S</ActionKbd>
						</Button.Root>
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							tabIndex={-1}
							className="gap-1.5 rounded-xl text-text-strong-950"
						>
							Documentation
							<ActionKbd>D</ActionKbd>
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="blue"
							size="small"
							tabIndex={-1}
							className="gap-1.5 rounded-xl"
						>
							<Icon name="plus" className="h-4 w-4" />
							Add domain
							<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
								C
							</ActionKbd>
						</FancyButton.Root>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					<div className="lg:col-span-9 xl:col-span-9">
						<div className="space-y-4">
							<div
								role="toolbar"
								aria-orientation="horizontal"
								className="flex w-full items-start justify-between gap-2"
							>
								<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
									<Input.Root
										size="small"
										className="w-40 rounded-xl shadow-none! lg:w-56"
									>
										<Input.Wrapper>
											<Input.Icon as={Icon} name="search" size="small" />
											<Input.Input
												readOnly
												tabIndex={-1}
												placeholder="Search domains..."
											/>
											<button
												type="button"
												tabIndex={-1}
												aria-label="Focus search"
												className="shrink-0 cursor-pointer rounded-[5px] outline-none"
											>
												<ActionKbd>/</ActionKbd>
											</button>
										</Input.Wrapper>
									</Input.Root>

									<button
										type="button"
										tabIndex={-1}
										className={toolbarControlClassName}
									>
										<Icon name="plus-circle" className="size-4" />
										Status
									</button>
								</div>

								<div className="flex shrink-0 items-center gap-2">
									<button
										type="button"
										tabIndex={-1}
										aria-label="Toggle columns"
										className={toolbarControlClassName}
									>
										<Icon name="gear" className="size-4 text-text-soft-400" />
										View
									</button>
									<button
										type="button"
										tabIndex={-1}
										className={cn(toolbarControlClassName, "gap-2 px-1.5")}
										aria-label="Refresh domains"
									>
										<Icon
											name="rotate-cw"
											className="h-3.5 w-3.5 shrink-0"
										/>
										<ActionKbd>R</ActionKbd>
									</button>
								</div>
							</div>

							<div className="w-full text-paragraph-sm">
								<div
									style={domainGridStyle}
									className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
								>
									<div className="flex items-center">
										<span className="flex size-4 shrink-0 rounded-sm border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5" />
									</div>
									<div className="flex items-center gap-1">
										<Icon name="globe" className="h-3 w-3" />
										<span className="text-xs">Domain</span>
									</div>
									<div className="flex items-center gap-1">
										<Icon name="activity" className="h-3 w-3" />
										<span className="text-xs">Status</span>
									</div>
									<div className="flex items-center gap-1">
										<Icon name="clock" className="h-3 w-3" />
										<span className="text-xs">Created At</span>
									</div>
									<div />
								</div>

								<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
									{DOMAINS.map((domain) => (
										<div
											key={domain.id}
											style={domainGridStyle}
											className="group/row grid w-full items-center px-4 py-2 text-left hover:bg-bg-weak-50"
										>
											<div className="flex items-center">
												<span className="flex size-4 shrink-0 rounded-sm border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5" />
											</div>
											<div className="flex min-w-0 items-center gap-2">
												<Icon
													name="globe"
													className={cn(
														"h-4 w-4 shrink-0",
														getStatusColorClass(domain.status),
													)}
												/>
												<span className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2">
													{domain.domain}
												</span>
											</div>
											<div className="flex items-center">
												<div
													className={cn(
														"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
														getStatusColorClass(domain.status),
													)}
												>
													<Icon
														name={getStatusIcon(domain.status)}
														className="h-3.5 w-3.5"
													/>
													{getStatusLabel(domain.status)}
												</div>
											</div>
											<div className="flex items-center">
												<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
													{domain.time}
												</span>
											</div>
											<div className="flex items-center justify-end">
												<span className="inline-flex aspect-square h-7 w-7 items-center justify-center rounded-lg">
													<Icon
														name="more-horizontal"
														className="h-3.5 w-3.5 text-text-sub-600"
													/>
												</span>
											</div>
										</div>
									))}

									<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
										<div className="flex items-center gap-3">
											<span>0 of 6 row(s) selected.</span>
											<button
												type="button"
												tabIndex={-1}
												className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-label-xs text-text-sub-600 uppercase outline-none"
											>
												10
												<Icon name="chevron-down" className="h-3 w-3" />
											</button>
										</div>
										<span className="px-2 text-text-sub-600 text-xs">
											Page 1 of 1
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="lg:col-span-3 xl:col-span-3">
						<aside className="space-y-3 lg:sticky lg:top-6">
							<div>
								<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
									Domain resources
								</h2>
								<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
									Guides & documentation for domain management.
								</p>
							</div>
							<div className={resourceCardClassName}>
								<div className="flex items-start justify-between gap-3">
									<h3 className="font-semibold text-sm text-text-strong-950">
										Configure DNS by provider
									</h3>
									<Icon
										name="chevron-right"
										className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400"
									/>
								</div>
								<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed">
									Step-by-step guides for Cloudflare, GoDaddy, Route 53,
									Namecheap, and more.
								</p>
							</div>
							<div className={resourceCardClassName}>
								<div className="flex items-start justify-between gap-3">
									<h3 className="font-semibold text-sm text-text-strong-950">
										Domain verification guide
									</h3>
									<Icon
										name="chevron-right"
										className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400"
									/>
								</div>
								<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed">
									Add a sending domain and verify SPF, DKIM, and DMARC for
									deliverability.
								</p>
							</div>
						</aside>
					</div>
				</div>
			</div>
		</div>
	);
}
