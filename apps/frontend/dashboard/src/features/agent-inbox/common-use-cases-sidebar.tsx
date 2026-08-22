import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

const cardClassName = cn(
	"group flex w-full cursor-pointer flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 text-left",
	"transition-[border-color,background-color,transform] duration-150 ease-out",
	"hover:border-stroke-soft-200 hover:bg-bg-weak-50/50",
	"active:scale-[0.99]",
	"dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20 dark:hover:bg-bg-weak-50/40",
);

export function AgentInboxCommonUseCasesSidebar() {
	const useCases = [
		{
			title: "Get started with Inbox",
			description:
				"Turn inbound addresses into programmable endpoints with AI routing and structured extraction.",
			href: "https://reloop.sh/docs/learn/agent-inbox",
		},
		{
			title: "Agent Email Inbox skill",
			description:
				"Install the Reloop skill so agents can read and reply to mailbox mail securely.",
			href: "https://reloop.sh/docs/integrations/agent-skills/agent-email-inbox",
		},
		{
			title: "OpenClaw setup guide",
			description:
				"Step-by-step guide for wiring an inbox into OpenClaw workflows.",
			href: "https://reloop.sh/docs/integrations/ai-tools/openclaw-guide",
		},
	];

	return (
		<aside className="space-y-4 lg:sticky lg:top-6">
			<div>
				<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
					Inbox resources
				</h2>
				<p className="mt-1 text-text-sub-600 text-sm leading-relaxed">
					Guides & documentation for inbox management.
				</p>
			</div>

			<div className="space-y-3">
				{useCases.map((item) => (
					<a
						key={item.title}
						href={item.href}
						target="_blank"
						rel="noreferrer"
						className={cardClassName}
					>
						<div className="flex items-start justify-between gap-3">
							<h3 className="font-semibold text-[15px] text-text-strong-950 transition-colors group-hover:text-[#1868DF] dark:group-hover:text-blue-400">
								{item.title}
							</h3>
							<Icon
								name="chevron-right"
								className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-text-sub-600"
							/>
						</div>
						<p className="mt-1.5 text-text-sub-600 text-sm leading-relaxed">
							{item.description}
						</p>
					</a>
				))}
			</div>
		</aside>
	);
}
