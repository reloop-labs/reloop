import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

const EMAILS = [
	{
		to: "maya@northwind.io",
		subject: "Welcome to Acme",
		status: "Delivered",
		time: "2m ago",
	},
	{
		to: "alex@orbit.dev",
		subject: "Reset your password",
		status: "Opened",
		time: "11m ago",
	},
	{
		to: "billing@northwind.io",
		subject: "Invoice #1024 is ready",
		status: "Delivered",
		time: "28m ago",
	},
	{
		to: "team@lumen.app",
		subject: "Confirm your email",
		status: "Clicked",
		time: "1h ago",
	},
	{
		to: "jordan@harbor.co",
		subject: "Your order has shipped",
		status: "Delivered",
		time: "2h ago",
	},
	{
		to: "priya@folio.io",
		subject: "Weekly usage report",
		status: "Sent",
		time: "4h ago",
	},
	{
		to: "nina@stackline.dev",
		subject: "Security alert for your account",
		status: "Bounced",
		time: "6h ago",
	},
	{
		to: "hello@pixeland.co",
		subject: "Payment receipt",
		status: "Failed",
		time: "1d ago",
	},
] as const;

const STATUS_STYLE: Record<
	(typeof EMAILS)[number]["status"],
	{ icon: string; className: string }
> = {
	Delivered: { icon: "check-circle", className: "text-emerald-600 dark:text-emerald-400" },
	Sent: { icon: "check-circle", className: "text-emerald-600 dark:text-emerald-400" },
	Opened: { icon: "eye-outline", className: "text-sky-600 dark:text-sky-400" },
	Clicked: { icon: "cursor-click", className: "text-violet-600 dark:text-violet-400" },
	Bounced: { icon: "minus-circle", className: "text-rose-600 dark:text-rose-400" },
	Failed: { icon: "minus-circle", className: "text-rose-600 dark:text-rose-400" },
};

export function HeroEmailsPreview() {
	return (
		<div className="flex h-full flex-col overflow-hidden px-5 pt-5 pb-28 sm:px-7 sm:pt-6 sm:pb-24">
			<div className="flex items-start justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						<Icon
							name="mail-send"
							className="size-5 text-text-strong-950 dark:text-white"
						/>
						<h3 className="font-semibold text-[22px] text-text-strong-950 tracking-tight dark:text-white">
							Email Sent
						</h3>
					</div>
					<p className="mt-1 text-[13px] text-text-sub-600 dark:text-white/45">
						Track and monitor your outbound transactional emails.
					</p>
				</div>
				<span className="hidden h-8 items-center rounded-xl border border-stroke-soft-200 px-3 text-[12px] text-text-sub-600 sm:inline-flex dark:border-white/10 dark:text-white/50">
					Documentation
				</span>
			</div>

			<div className="mt-4 flex items-center gap-1 border-stroke-soft-200 border-b dark:border-white/10">
				<span className="inline-flex h-9 items-center gap-1.5 border-text-strong-950 border-b-2 px-3 font-medium text-[13px] text-text-strong-950 dark:border-white dark:text-white">
					<Icon name="mail-send" className="size-3.5" />
					Sent
				</span>
				<span className="inline-flex h-9 items-center gap-1.5 px-3 text-[13px] text-text-soft-400 dark:text-white/40">
					<Icon name="mail-receive" className="size-3.5" />
					Received
				</span>
			</div>

			<div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl border border-stroke-soft-200 dark:border-white/10">
				<div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_88px_72px] gap-3 border-stroke-soft-200 border-b bg-bg-weak-50/70 px-3 py-2 text-[11px] text-text-soft-400 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_104px_80px] sm:px-4 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/35">
					<span>To</span>
					<span>Subject</span>
					<span>Status</span>
					<span className="text-right">Time</span>
				</div>
				<ul className="divide-y divide-stroke-soft-200 dark:divide-white/10">
					{EMAILS.map((email, index) => {
						const status = STATUS_STYLE[email.status];
						return (
							<li
								key={email.to + email.subject}
								className={cn(
									"grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_88px_72px] items-center gap-3 px-3 py-2.5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_104px_80px] sm:px-4",
									index === 0 && "bg-bg-weak-50/80 dark:bg-white/[0.04]",
								)}
							>
								<span className="truncate text-[12px] text-text-sub-600 dark:text-white/55">
									{email.to}
								</span>
								<span className="truncate font-medium text-[12px] text-text-strong-950 dark:text-white">
									{email.subject}
								</span>
								<span
									className={cn(
										"inline-flex items-center gap-1 text-[11px]",
										status.className,
									)}
								>
									<Icon name={status.icon} className="size-3 shrink-0" />
									<span className="hidden sm:inline">{email.status}</span>
								</span>
								<span className="text-right text-[11px] text-text-soft-400 tabular-nums dark:text-white/40">
									{email.time}
								</span>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
