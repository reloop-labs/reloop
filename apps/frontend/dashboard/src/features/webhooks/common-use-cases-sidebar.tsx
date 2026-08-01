import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { siNodedotjs, siPhp, siPython } from "simple-icons";
import { WebhooksApiDetails } from "#/components/api-details/webhooks";

const cardClassName = cn(
	"group flex w-full cursor-pointer flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left",
	"transition-[border-color,background-color,transform] duration-150 ease-out",
	"hover:border-stroke-soft-200 hover:bg-bg-weak-50/50",
	"active:scale-[0.99]",
	"dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20 dark:hover:bg-bg-weak-50/40",
);

const sdkLanguages = [
	{ id: "nodejs", label: "Node.js", icon: siNodedotjs },
	{ id: "python", label: "Python", icon: siPython },
	{ id: "php", label: "PHP", icon: siPhp },
] as const;

export function WebhooksCommonUseCasesSidebar() {
	const useCases = [
		{
			title: "Verify signed payloads",
			description:
				"Validate HMAC-SHA256 signatures so you only process events from Reloop.",
			href: "https://reloop.sh/docs/learn/webhook",
		},
		{
			title: "Handle delivery retries",
			description:
				"Failed deliveries retry with backoff — design handlers to be idempotent.",
			href: "https://reloop.sh/docs/learn/webhook",
		},
	];

	return (
		<aside className="space-y-3 lg:sticky lg:top-6">
			<div>
				<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
					Webhook SDKs & endpoints
				</h2>
				<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
					Ready-to-run samples for create, list, and delete.
				</p>
			</div>

			<WebhooksApiDetails
				renderTrigger={({
					isOpen,
					open,
				}: {
					isOpen: boolean;
					open: () => void;
				}) => (
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
							<span className="font-semibold text-sm text-text-strong-950 transition-colors group-hover:text-[#1868DF] dark:group-hover:text-blue-400">
								Browse samples
							</span>
							<Icon
								name="chevron-right"
								className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-text-sub-600"
							/>
						</div>
						<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed">
							Create, list, and manage webhook endpoints via API.
						</p>
						<div className="mt-2.5 flex items-center gap-0.5">
							{sdkLanguages.map(({ id, label, icon }) => (
								<span
									key={id}
									title={label}
									className="flex items-center justify-center p-0.5"
								>
									<svg
										role="img"
										viewBox="0 0 24 24"
										width={16}
										height={16}
										aria-hidden
										className="shrink-0"
										fill={`#${icon.hex}`}
									>
										<path d={icon.path} />
									</svg>
								</span>
							))}
						</div>
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
