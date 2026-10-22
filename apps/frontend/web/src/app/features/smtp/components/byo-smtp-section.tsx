import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { SectionHeader } from "./section-header";
import { SMTP_HOST } from "./smtp-data";

const POINTS = [
	"Assign a domain to any SMTP provider in a few clicks",
	"Credentials are tested before a single email goes out",
	"Templates, automations, and logs stay in Reloop",
	"Move a domain back to Reloop SMTP whenever you want",
];

const SERVERS: {
	name: string;
	host: string;
	domains: string;
	isDefault?: boolean;
}[] = [
	{
		name: "Reloop SMTP",
		host: SMTP_HOST,
		domains: "All other domains",
		isDefault: true,
	},
	{
		name: "Amazon SES",
		host: "email-smtp.us-east-1.amazonaws.com",
		domains: "mail.acme.com",
	},
	{
		name: "Postmark",
		host: "smtp.postmarkapp.com",
		domains: "billing.acme.com",
	},
	{
		name: "Google Workspace",
		host: "smtp.gmail.com",
		domains: "team.acme.com",
	},
];

export function ByoSmtpSection() {
	return (
		<section
			id="bring-your-own"
			aria-labelledby="bring-your-own-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<SectionHeader
				id="bring-your-own-heading"
				icon="split-route"
				eyebrow="Bring your own"
				title={
					<>
						Already have an SMTP provider?
						<br />
						Keep it.
					</>
				}
				description="Route any domain through SES, Postmark, Google Workspace, or your own server, and still run templates, automations, and analytics from one place."
			/>

			<div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
				<div className="flex flex-col justify-center gap-8 border-stroke-soft-100 border-b px-4 py-10 sm:px-8 lg:border-r lg:border-b-0 lg:px-12 lg:py-12 dark:border-white/10">
					<ul className="space-y-4">
						{POINTS.map((point) => (
							<li
								key={point}
								className="flex items-start gap-3 text-[15px] leading-snug"
							>
								<Icon
									name="check-circle"
									className="mt-0.5 size-4 shrink-0 text-text-strong-950 dark:text-white"
									aria-hidden
								/>
								<span className="text-text-sub-600 dark:text-white/70">
									{point}
								</span>
							</li>
						))}
					</ul>
					<a
						href={hostedSignupHref}
						className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 hover:text-text-sub-600 dark:text-white dark:hover:text-white/70"
					>
						Connect your SMTP server
						<Icon
							name="arrow-right"
							className="size-3 transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</a>
				</div>

				<div className="relative overflow-hidden bg-gradient-to-t from-[#dbe7ff] via-[#eef3ff] to-bg-white-0 px-4 py-6 sm:p-10 lg:p-12 dark:from-[#0b1b33] dark:via-[#060b16] dark:to-black">
					<div
						aria-hidden
						className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] sm:rounded-2xl dark:border-white/10 dark:bg-black dark:shadow-black/60"
					>
						<div className="flex h-12 items-center justify-between gap-3 border-stroke-soft-100 border-b px-5 dark:border-white/10">
							<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
								SMTP servers
							</span>
							<span className="inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 px-2 py-1 font-medium text-[12px] text-text-strong-950 dark:border-white/10 dark:text-white">
								<Icon name="plus" className="size-3.5" />
								Add server
							</span>
						</div>
						<ul>
							{SERVERS.map((server) => (
								<li
									key={server.name}
									className="flex items-center gap-3.5 border-stroke-soft-100 border-b px-5 py-4 last:border-b-0 dark:border-white/10"
								>
									<span
										className={cn(
											"flex size-9 shrink-0 items-center justify-center rounded-lg border",
											server.isDefault
												? "border-text-strong-950 bg-text-strong-950 text-white dark:border-white dark:bg-white dark:text-black"
												: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60",
										)}
									>
										<Icon
											name={server.isDefault ? "reloop" : "mail-server"}
											className="size-4"
										/>
									</span>
									<span className="flex min-w-0 flex-1 flex-col">
										<span className="flex items-center gap-2">
											<span className="truncate font-medium text-[13.5px] text-text-strong-950 dark:text-white">
												{server.name}
											</span>
											{server.isDefault && (
												<span className="shrink-0 rounded-full bg-bg-weak-50 px-1.5 py-px font-medium text-[10.5px] text-text-sub-600 dark:bg-white/[0.06] dark:text-white/50">
													Default
												</span>
											)}
										</span>
										<span className="truncate font-mono text-[11.5px] text-text-sub-600 dark:text-white/40">
											{server.host}
										</span>
									</span>
									<span className="hidden shrink-0 text-right text-[12.5px] text-text-sub-600 sm:block dark:text-white/50">
										{server.domains}
									</span>
									<span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] text-emerald-700 dark:text-emerald-400">
										<span className="size-1.5 rounded-full bg-current" />
										Connected
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
