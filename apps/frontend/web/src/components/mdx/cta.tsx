import * as Button from "@reloop/ui/button";
import Link from "next/link";

export function Cta({
	title,
	description,
	href,
	label,
	external,
}: {
	title: string;
	description: string;
	href: string;
	label: string;
	external?: boolean;
}) {
	const isCrossDomain =
		href.startsWith("/docs") || href.startsWith("/dashboard");

	const className = Button.buttonVariants({
		variant: "neutral",
		mode: "filled",
	}).root({
		className: "mt-4 inline-flex rounded-full",
	});

	const button = external || isCrossDomain ? (
		<a
			href={href}
			target={external ? "_blank" : undefined}
			rel={external ? "noopener noreferrer" : undefined}
			className={className}
		>
			{label}
		</a>
	) : (
		<Link href={href} className={className}>
			{label}
		</Link>
	);

	return (
		<aside className="my-8 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 dark:border-white/10 dark:bg-white/[0.03]">
			<h3 className="font-semibold text-[18px] text-text-strong-950 dark:text-white">
				{title}
			</h3>
			<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
				{description}
			</p>
			{button}
		</aside>
	);
}
