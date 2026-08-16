import { cn } from "@reloop/ui/cn";
import Link from "next/link";

const convictions = [
	{ label: "Open source", href: "/why-open-source" },
	{ label: "No lock-in", href: "/why-open-source" },
	{ label: "Self-host it", href: "/docs/setup" },
	{ label: "Own the stack", href: "/our-product-beliefs" },
	{ label: "Agents first", href: "/features/ai-agents" },
	{ label: "Your keys" },
	{ label: "No black box", href: "/why-open-source" },
	{ label: "One API", href: "/developers" },
	{ label: "See every send", href: "/features/email-analytics" },
	{ label: "Built in public", href: "/changelog" },
] as const;

export default function Convictions() {
	return (
		<section
			aria-labelledby="convictions-heading"
			className="border-stroke-soft-200 border-t dark:border-white/10"
		>
			<h2 id="convictions-heading" className="sr-only">
				What we will not compromise on
			</h2>
			<div className="grid grid-cols-2 lg:grid-cols-5">
				{convictions.map((item) => {
					const className = cn(
						"flex min-h-[7.25rem] items-center justify-center border-stroke-soft-200 border-r border-b px-4 text-center sm:min-h-[8.5rem] dark:border-white/10",
						"max-lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(5n)]:border-r-0",
					);
					const mark = (
						<span className="font-semibold text-[14px] text-text-sub-600 tracking-[-0.02em] transition-colors duration-200 sm:text-[15px] dark:text-white/55">
							{item.label}
						</span>
					);

					if ("href" in item && item.href) {
						const isDocs = item.href.startsWith("/docs");
						if (isDocs) {
							return (
								<a
									key={item.label}
									href={item.href}
									className={cn(
										className,
										"hover:bg-bg-weak-50/70 dark:hover:bg-white/[0.02] hover:[&_span]:text-text-strong-950 dark:hover:[&_span]:text-white",
									)}
								>
									{mark}
								</a>
							);
						}
						return (
							<Link
								key={item.label}
								href={item.href}
								className={cn(
									className,
									"hover:bg-bg-weak-50/70 dark:hover:bg-white/[0.02] hover:[&_span]:text-text-strong-950 dark:hover:[&_span]:text-white",
								)}
							>
								{mark}
							</Link>
						);
					}

					return (
						<div key={item.label} className={className}>
							{mark}
						</div>
					);
				})}
			</div>
		</section>
	);
}
