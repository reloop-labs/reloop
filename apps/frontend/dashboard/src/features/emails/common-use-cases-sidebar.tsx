import { usePathname } from "next/navigation";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

const cardClassName = cn(
	"group flex w-full flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left cursor-pointer",
	"transition-[border-color,background-color,transform] duration-150 ease-out",
	"hover:border-stroke-soft-200 hover:bg-bg-weak-50/50",
	"active:scale-[0.99]",
	"dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20 dark:hover:bg-bg-weak-50/40",
);

export function EmailsCommonUseCasesSidebar() {
	const pathname = usePathname();
	const isReceived =
		pathname === "/receive" || pathname.startsWith("/receive/");

	const useCases = isReceived
		? [
				{
					title: "Inbox for inbound mail",
					description:
						"Route messages from dedicated inbox addresses into conversations and workflows.",
					href: "https://reloop.sh/docs/learn/agent-inbox",
				},
				{
					title: "Inbound message lifecycle",
					description:
						"Understand statuses as messages are received, parsed, and handled.",
					href: "https://reloop.sh/docs/learn/emails",
				},
			]
		: [
				{
					title: "Send transactional email",
					description:
						"Password resets, receipts, and notifications via the REST API.",
					href: "https://reloop.sh/docs/api/mail/post-api-mail-v1send",
				},
				{
					title: "Connect via SMTP",
					description:
						"Point Nodemailer, Laravel, or Rails at Reloop with your API key.",
					href: "https://reloop.sh/docs/examples/smtp/introduction",
				},
			];

	return (
		<aside className="space-y-3 lg:sticky lg:top-6">
			<div>
				<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
					{isReceived ? "Inbound guides" : "Outbound guides"}
				</h2>
				<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
					{isReceived
						? "Wire receiving into inboxes and automations."
						: "Ship email and monitor delivery from your apps."}
				</p>
			</div>

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
