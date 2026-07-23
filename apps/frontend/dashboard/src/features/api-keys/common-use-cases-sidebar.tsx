import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { siGo, siNodedotjs, siPython, siRust } from "simple-icons";
import { ApiKeysApiDetails } from "#/components/api-details/api-keys";

const cardClassName = cn(
	"group flex w-full flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left",
	"transition-[border-color,background-color,transform] duration-150 ease-out",
	"hover:border-stroke-soft-200 hover:bg-bg-weak-50/50",
	"active:scale-[0.99]",
	"dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20 dark:hover:bg-bg-weak-50/40",
);

const sdkLanguages = [
	{ id: "nodejs", label: "Node.js", icon: siNodedotjs },
	{ id: "python", label: "Python", icon: siPython },
	{ id: "rust", label: "Rust", icon: siRust },
	{ id: "go", label: "Go", icon: siGo },
] as const;

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
	];

	return (
		<aside className="space-y-3 lg:sticky lg:top-6">
			<div>
				<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
					API key SDKs & endpoints
				</h2>
				<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
					Ready-to-run samples for every key operation.
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
							<span className="font-semibold text-sm text-text-strong-950 transition-colors group-hover:text-[#1868DF] dark:group-hover:text-blue-400">
								Browse samples
							</span>
							<Icon
								name="chevron-right"
								className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-text-sub-600"
							/>
						</div>
						<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed">
							Create, list, rotate, and manage keys in your stack.
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
