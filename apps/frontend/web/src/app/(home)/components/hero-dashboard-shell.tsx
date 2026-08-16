import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import type { ReactNode } from "react";

const NAV: {
	section: string;
	items: { label: string; icon: string; id: string }[];
}[] = [
	{
		section: "Main",
		items: [
			{ id: "emails", label: "Emails", icon: "mail-single" },
			{ id: "inbox", label: "Inbox", icon: "inbox" },
		],
	},
	{
		section: "Messaging",
		items: [
			{ id: "contacts", label: "Contacts", icon: "contacts" },
			{ id: "templates", label: "Templates", icon: "layout" },
		],
	},
	{
		section: "Analytics",
		items: [
			{ id: "metrics", label: "Metrics", icon: "fat-row" },
			{ id: "logs", label: "Logs", icon: "logs" },
		],
	},
	{
		section: "Developer",
		items: [
			{ id: "api-keys", label: "API Keys", icon: "key-new" },
			{ id: "domain", label: "Domain", icon: "globe" },
			{ id: "webhooks", label: "Webhooks", icon: "webhook" },
			{ id: "integrations", label: "Integrations", icon: "integration" },
			{ id: "smtp", label: "SMTP", icon: "smtp" },
		],
	},
	{
		section: "Settings",
		items: [{ id: "settings", label: "Settings", icon: "gear" }],
	},
];

export function HeroDashboardShell({
	children,
	activeItem = "metrics",
}: {
	children: ReactNode;
	activeItem?: string;
}) {
	return (
		<div className="flex h-full min-h-0 bg-bg-white-0 dark:bg-black">
			<aside className="hidden h-full w-[13.5rem] shrink-0 flex-col border-stroke-soft-200 border-r bg-bg-white-0 md:flex dark:border-white/10 dark:bg-[#0a0a0a]">
				<div className="flex h-11 shrink-0 items-center gap-1.5 px-3">
					<Logo className="-ml-0.5 w-8" />
					<span className="-ml-1 font-semibold text-[13px] text-text-strong-950 dark:text-white">
						Reloop
					</span>
					<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-1.5 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
						Beta
					</span>
				</div>
				<nav className="min-h-0 flex-1 overflow-hidden px-2 pb-3">
					{NAV.map((group, groupIndex) => (
						<div key={group.section}>
							<p
								className={cn(
									"px-2.5 pb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]",
									groupIndex === 0 ? "pt-1" : "pt-3",
								)}
							>
								{group.section}
							</p>
							<ul className="flex flex-col">
								{group.items.map((item) => {
									const active = item.id === activeItem;
									return (
										<li key={item.id}>
											<div
												className={cn(
													"flex h-8 items-center gap-2.5 rounded-lg px-2.5",
													active && "bg-bg-weak-50 dark:bg-white/[0.06]",
												)}
											>
												<Icon
													name={item.icon}
													className={cn(
														"size-4 shrink-0",
														active
															? "text-text-strong-950 dark:text-white"
															: "text-text-sub-600",
													)}
												/>
												<span
													className={cn(
														"truncate font-medium text-[13px]",
														active
															? "text-text-strong-950 dark:text-white"
															: "text-text-sub-600",
													)}
												>
													{item.label}
												</span>
											</div>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</nav>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex h-11 shrink-0 items-center justify-between border-stroke-soft-200 border-b px-3 dark:border-white/10">
					<div className="flex items-center gap-1.5">
						<span className="hidden size-7 items-center justify-center rounded-lg text-text-soft-400 md:flex dark:text-white/35">
							<svg viewBox="0 0 16 16" className="size-3.5" fill="none">
								<rect
									x="2"
									y="2.5"
									width="12"
									height="11"
									rx="1.6"
									stroke="currentColor"
									strokeWidth="1.3"
								/>
								<path d="M6 2.5v11" stroke="currentColor" strokeWidth="1.3" />
							</svg>
						</span>
						<span className="flex items-center gap-1.5 rounded-lg px-1.5 py-1">
							<span className="flex size-5 items-center justify-center rounded-md bg-amber-100 font-medium text-[10px] text-amber-900 dark:bg-amber-400/20 dark:text-amber-200">
								A
							</span>
							<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
								Acme
							</span>
							<Icon
								name="chevron-down"
								className="size-3 text-text-soft-400 dark:text-white/35"
							/>
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="hidden h-7 items-center rounded-lg px-2 text-[12px] text-text-sub-600 sm:inline-flex dark:text-white/50">
							Copy prompt
						</span>
						<span className="hidden h-7 items-center gap-1 rounded-lg px-2 text-[12px] text-text-sub-600 sm:inline-flex dark:text-white/50">
							<Icon name="question" className="size-3.5" />
							Support
						</span>
						<span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 font-medium text-[10px] text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-200">
							P
						</span>
					</div>
				</header>
				<div className="min-h-0 flex-1 overflow-hidden">{children}</div>
			</div>
		</div>
	);
}
