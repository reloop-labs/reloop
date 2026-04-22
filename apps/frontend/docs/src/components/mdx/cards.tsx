import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { NextjsIcon } from "../icons/Tech";

const iconMap = {
	NodejsIcon: <NextjsIcon className="h-4 w-4" />,
	NextjsIcon: <NextjsIcon className="h-4 w-4" />,
	ExpressIcon: (
		<span className="font-bold text-sm leading-none tracking-tighter">ex</span>
	),
	PHPIcon: <Icon name="modules" className="h-4 w-4" />,
	LaravelIcon: <Icon name="cube" className="h-4 w-4" />,
	PythonIcon: <Icon name="code" className="h-4 w-4" />,
	GoIcon: <Icon name="terminal" className="h-4 w-4" />,
	RubyIcon: <Icon name="ruby" className="h-4 w-4" />,
};

interface CardsProps {
	children: ReactNode;
}

export function Cards({ children }: CardsProps) {
	return (
		<div className="not-prose mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{children}
		</div>
	);
}

interface CardProps {
	title: string;
	icon?: string | ReactNode;
	href?: string;
	subtitle?: string;
}

export function Card({ title, icon, href, subtitle }: CardProps) {
	const mappedIcon =
		typeof icon === "string" ? iconMap[icon as keyof typeof iconMap] : icon;

	const content = (
		<div className="group relative flex min-h-[120px] flex-col justify-between overflow-hidden rounded-[1.25rem] border border-fd-border bg-fd-background p-[18px] transition-all hover:border-fd-foreground/20 hover:shadow-sm">
			<div className="flex h-full flex-col gap-3">
				{mappedIcon && (
					<div className="flex h-8 w-8 items-center justify-center rounded-full border border-fd-border bg-fd-muted text-fd-foreground opacity-80 transition-opacity group-hover:opacity-100">
						{mappedIcon}
					</div>
				)}
				<div className="mt-auto">
					<h3 className="-tracking-[0.01em] font-semibold text-fd-foreground text-[15px]">
						{title}
					</h3>
					{subtitle && (
						<p className="mt-1 text-fd-muted-foreground text-sm">{subtitle}</p>
					)}
				</div>
			</div>
		</div>
	);

	if (href) {
		return (
			<Link href={href} className="block no-underline">
				{content}
			</Link>
		);
	}

	return content;
}
