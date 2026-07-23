import { Icon } from "@reloop/ui/icon";

export function CommonUseCasesSidebar() {
	const useCases = [
		{
			title: "Send transactional email",
			description:
				"Password resets, receipts, and app notifications via the REST API.",
			href: "https://reloop.sh/docs/api/mail/post-api-mail-v1send",
		},
		{
			title: "Connect via SMTP",
			description:
				"Use your current mail library—point Nodemailer, Laravel, or Rails at Reloop.",
			href: "https://reloop.sh/docs/examples/smtp/introduction",
		},
		{
			title: "React to delivery events",
			description:
				"Webhooks for bounces, opens, and clicks so you can act without polling.",
			href: "https://reloop.sh/docs/learn/webhooks",
		},
	];

	return (
		<div className="space-y-4">
			<div>
				<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
					Use your key to…
				</h2>
				<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
					Same key for API and SMTP—pick the path that fits your stack.
				</p>
			</div>

			<div className="space-y-3">
				{useCases.map((item) => (
					<a
						key={item.title}
						href={item.href}
						target="_blank"
						rel="noreferrer"
						className="group flex flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 transition-all duration-200 hover:border-stroke-soft-200 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20"
					>
						<div className="flex items-center justify-between gap-2">
							<h3 className="font-semibold text-sm text-text-strong-950 transition-colors group-hover:text-[#1868DF] dark:group-hover:text-blue-400">
								{item.title}
							</h3>
							<Icon
								name="chevron-right"
								className="h-4 w-4 shrink-0 text-text-sub-600 transition-transform group-hover:translate-x-0.5"
							/>
						</div>
						<p className="mt-2 text-text-sub-600 text-xs leading-relaxed">
							{item.description}
						</p>
					</a>
				))}
			</div>
		</div>
	);
}
