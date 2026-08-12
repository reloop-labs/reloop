import { Icon } from "@reloop/ui/icon";
import { socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";
import type { ReactNode } from "react";

type ExtraLink = {
	icon: string;
	iconFill: "none" | "currentColor";
	href: string;
	external?: boolean;
	before: string;
	label: string;
	after?: string;
};

const LINKS: ExtraLink[] = [
	{
		icon: "headset",
		iconFill: "none",
		href: "/contact",
		before: "Need help?",
		label: "Contact Support",
		after: ".",
	},
	{
		icon: "terminal",
		iconFill: "currentColor",
		href: socialProfiles.discord,
		external: true,
		before: "Chat with Reloop developers on",
		label: "Discord",
		after: ".",
	},
	{
		icon: "file-text",
		iconFill: "none",
		href: "/changelog",
		before: "Check out our",
		label: "changelog",
		after: ".",
	},
	{
		icon: "question",
		iconFill: "none",
		href: "/contact",
		before: "Questions?",
		label: "Contact Sales",
		after: ".",
	},
	{
		icon: "zap",
		iconFill: "none",
		href: "/llms.txt",
		external: true,
		before: "LLM?",
		label: "Read llms.txt",
		after: ".",
	},
];

function LinkLabel({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) {
	const className =
		"font-medium text-primary-link hover:underline";

	if (external) {
		return (
			<a href={href} target="_blank" rel="noreferrer" className={className}>
				{children}
			</a>
		);
	}

	return (
		<Link href={href} className={className}>
			{children}
		</Link>
	);
}

export function ExtraLinks() {
	return (
		<ul className="flex flex-col gap-2.5 text-[13px] text-text-sub-600 dark:text-white/55">
			{LINKS.map((item) => (
				<li key={item.label} className="flex items-center gap-2.5">
					<Icon
						name={item.icon}
						fill={item.iconFill}
						className="size-3.5 shrink-0 text-text-soft-400 dark:text-white/35"
						aria-hidden
					/>
					<span>
						{item.before}{" "}
						<LinkLabel href={item.href} external={item.external}>
							{item.label}
						</LinkLabel>
						{item.after}
					</span>
				</li>
			))}
		</ul>
	);
}
