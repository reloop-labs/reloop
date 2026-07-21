import { cn } from "@reloop/ui/cn";

export function SectionCard({
	title,
	description,
	action,
	children,
	className,
	bodyClassName,
	id,
}: {
	title?: string;
	description?: string;
	action?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	bodyClassName?: string;
	id?: string;
}) {
	return (
		<section
			id={id}
			className={cn(
				"overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]",
				className,
			)}
		>
			{(title || action) && (
				<div className="flex flex-wrap items-start justify-between gap-2 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
					<div className="min-w-0">
						{title ? (
							<h2 className="font-semibold text-[13px] text-text-strong-950 tracking-tight">
								{title}
							</h2>
						) : null}
						{description ? (
							<p className="mt-0.5 text-[12px] text-text-sub-600">
								{description}
							</p>
						) : null}
					</div>
					{action ? <div className="shrink-0">{action}</div> : null}
				</div>
			)}
			<div className={cn(bodyClassName)}>{children}</div>
		</section>
	);
}
