import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { siGo, siNodedotjs, siPython, siRust } from "simple-icons";
import { ApiKeysApiDetails } from "#/components/api-details/api-keys";

const linkClassName = cn(
	"group inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-text-sub-600 text-xs transition-colors",
	"hover:bg-bg-weak-50 hover:text-text-strong-950",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868DF]/40",
	"dark:hover:bg-bg-weak-50/40",
);

const sdkLanguages = [
	{ id: "nodejs", label: "Node.js", icon: siNodedotjs },
	{ id: "python", label: "Python", icon: siPython },
	{ id: "rust", label: "Rust", icon: siRust },
	{ id: "go", label: "Go", icon: siGo },
] as const;

const externalLinks = [
	{
		title: "Send transactional email",
		href: "https://reloop.sh/docs/api/mail/post-api-mail-v1send",
	},
	{
		title: "Connect via SMTP",
		href: "https://reloop.sh/docs/examples/smtp/introduction",
	},
] as const;

export function ApiKeysResourcesBanner() {
	return (
		<div className="flex flex-col gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 sm:flex-row sm:items-center sm:gap-3 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
			<div className="flex shrink-0 items-center gap-1.5 px-0.5">
				<Icon
					name="code"
					className="h-3.5 w-3.5 text-text-soft-400"
				/>
				<span className="font-medium text-subheading-2xs text-text-soft-400 uppercase tracking-wide">
					SDKs & guides
				</span>
			</div>

			<div
				aria-hidden
				className="hidden h-4 w-px shrink-0 bg-stroke-soft-100 sm:block dark:bg-stroke-soft-100/40"
			/>

			<nav
				aria-label="API key SDKs and guides"
				className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5"
			>
				<ApiKeysApiDetails
					renderTrigger={({ isOpen, open }) => (
						<button
							type="button"
							onClick={open}
							aria-expanded={isOpen}
							className={cn(
								linkClassName,
								isOpen && "bg-bg-weak-50 text-text-strong-950",
							)}
						>
							<span>Browse samples</span>
							<span className="hidden items-center gap-0.5 sm:inline-flex">
								{sdkLanguages.map(({ id, label, icon }) => (
									<span
										key={id}
										title={label}
										className="flex items-center justify-center"
									>
										<svg
											role="img"
											viewBox="0 0 24 24"
											width={12}
											height={12}
											aria-hidden
											className="shrink-0 opacity-80"
											fill={`#${icon.hex}`}
										>
											<path d={icon.path} />
										</svg>
									</span>
								))}
							</span>
							<Icon
								name="chevron-right"
								className="h-3 w-3 shrink-0 text-text-soft-400 transition-transform duration-150 group-hover:translate-x-0.5"
							/>
						</button>
					)}
				/>

				{externalLinks.map((item) => (
					<a
						key={item.title}
						href={item.href}
						target="_blank"
						rel="noreferrer"
						className={linkClassName}
					>
						<span className="truncate">{item.title}</span>
						<Icon
							name="arrow-up-right"
							className="h-3 w-3 shrink-0 text-text-soft-400 transition-colors group-hover:text-text-sub-600"
						/>
					</a>
				))}
			</nav>
		</div>
	);
}
