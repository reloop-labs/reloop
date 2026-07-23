import { ApiKeysApiDetails } from "#/components/api-details/api-keys";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

const cardClassName = cn(
	"group flex w-full flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left",
	"transition-[border-color,background-color,transform] duration-150 ease-out",
	"hover:border-stroke-soft-200 hover:bg-bg-weak-50/50",
	"active:scale-[0.99]",
	"dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20 dark:hover:bg-bg-weak-50/40",
);

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
		<aside className="space-y-3 lg:sticky lg:top-6">
			<div>
				<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
					API reference
				</h2>
				<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
					Code samples for every key operation.
				</p>
			</div>

			<ApiKeysApiDetails
				renderTrigger={({ isOpen, open }) => (
					<button
						type="button"
						onClick={open}
						aria-expanded={isOpen}
						className={cn(
							cardClassName,
							isOpen && "border-stroke-soft-200 bg-bg-weak-50/60",
						)}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="flex min-w-0 items-center gap-2">
								<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600 dark:bg-bg-white-0/5">
									<Icon name="code" className="h-3.5 w-3.5" />
								</span>
								<span className="font-semibold text-sm text-text-strong-950 transition-colors group-hover:text-[#1868DF] dark:group-hover:text-blue-400">
									Browse endpoints
								</span>
							</div>
							<Icon
								name="chevron-right"
								className="mt-1.5 h-4 w-4 shrink-0 text-text-soft-400 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-text-sub-600"
							/>
						</div>
						<p className="mt-2 text-text-sub-600 text-xs leading-relaxed">
							List, create, rotate, enable, and delete keys in your stack.
						</p>
					</button>
				)}
			/>

			{useCases.map((item) => (
				<a
					key={item.title}
					href={item.href}
					target="_blank"
					rel="noreferrer"
					className={cardClassName}
				>
					<div className="flex items-start justify-between gap-3">
						<h3 className="font-semibold text-sm text-text-strong-950 transition-colors group-hover:text-[#1868DF] dark:group-hover:text-blue-400">
							{item.title}
						</h3>
						<Icon
							name="chevron-right"
							className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-text-sub-600"
						/>
					</div>
					<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed">
						{item.description}
					</p>
				</a>
			))}
		</aside>
	);
}
