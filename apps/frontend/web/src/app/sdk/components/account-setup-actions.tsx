import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

const SETUP_ACTIONS = [
	{
		href: "/dashboard/api-keys/create",
		icon: "key",
		iconFill: "currentColor",
		title: "Get an API key",
	},
	{
		href: "/dashboard/domain/add",
		icon: "globe",
		iconFill: "none",
		title: "Add a domain",
	},
] as const;

export function AccountSetupActions({ className }: { className?: string }) {
	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{SETUP_ACTIONS.map((action) => (
				<a
					key={action.href}
					href={action.href}
					className="inline-flex items-center gap-2 font-medium text-[13px] text-text-strong-950 transition-colors duration-150 hover:text-text-sub-600 dark:text-white dark:hover:text-white/70"
				>
					<Icon
						name={action.icon}
						fill={action.iconFill}
						className="size-3.5 shrink-0"
						aria-hidden
					/>
					{action.title}
				</a>
			))}
		</div>
	);
}
