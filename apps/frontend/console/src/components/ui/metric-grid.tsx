import { cn } from "@reloop/ui/cn";
import Link from "next/link";

export type Metric = {
	label: string;
	value: string | number;
	hint?: string;
	href?: string;
	tone?: "default" | "danger" | "warning" | "success";
};

export function MetricGrid({
	items,
	className,
}: {
	items: Metric[];
	className?: string;
}) {
	return (
		<div
			className={cn(
				"grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-100 bg-stroke-soft-100 dark:border-stroke-soft-100/40 dark:bg-stroke-soft-100/40",
				"sm:grid-cols-2 xl:grid-cols-4",
				className,
			)}
		>
			{items.map((item) => {
				const toneClass =
					item.tone === "danger"
						? "text-error-base"
						: item.tone === "warning"
							? "text-orange-600 dark:text-orange-400"
							: item.tone === "success"
								? "text-emerald-600 dark:text-emerald-400"
								: "text-text-strong-950";

				const inner = (
					<>
						<p className="text-[11px] text-text-sub-600 uppercase tracking-wide">
							{item.label}
						</p>
						<p
							className={cn(
								"mt-1.5 font-semibold text-[22px] tabular-nums tracking-tight",
								toneClass,
							)}
						>
							{item.value}
						</p>
						{item.hint ? (
							<p className="mt-1 text-[11px] text-text-sub-600">{item.hint}</p>
						) : null}
					</>
				);

				if (item.href) {
					return (
						<Link
							key={item.label}
							href={item.href}
							className="bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50 dark:bg-[#0c0c0c] dark:hover:bg-white/[0.03]"
						>
							{inner}
						</Link>
					);
				}

				return (
					<div
						key={item.label}
						className="bg-bg-white-0 p-4 dark:bg-[#0c0c0c]"
					>
						{inner}
					</div>
				);
			})}
		</div>
	);
}
