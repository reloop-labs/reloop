import { cn } from "@reloop/ui/cn";
import Link from "next/link";

export function PageFrame({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("mx-auto w-full max-w-[1280px] space-y-6", className)}>
			{children}
		</div>
	);
}

export function PageHeading({
	eyebrow,
	title,
	description,
	actions,
	meta,
}: {
	eyebrow?: React.ReactNode;
	title: React.ReactNode;
	description?: React.ReactNode;
	actions?: React.ReactNode;
	meta?: React.ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-start justify-between gap-4">
			<div className="min-w-0 space-y-2">
				{eyebrow ? (
					<div className="text-[12px] text-text-sub-600">{eyebrow}</div>
				) : null}
				<div className="flex flex-wrap items-center gap-2.5">
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						{title}
					</h1>
					{meta}
				</div>
				{description ? (
					<div className="max-w-2xl text-[13px] text-text-sub-600 leading-relaxed">
						{description}
					</div>
				) : null}
			</div>
			{actions ? (
				<div className="flex flex-wrap items-center gap-2">{actions}</div>
			) : null}
		</div>
	);
}

export function Breadcrumb({
	items,
}: {
	items: Array<{ label: string; href?: string }>;
}) {
	return (
		<nav className="flex flex-wrap items-center gap-1.5 text-[12px] text-text-sub-600">
			{items.map((item, i) => (
				<span
					key={`${item.label}-${i}`}
					className="inline-flex items-center gap-1.5"
				>
					{i > 0 ? <span className="text-text-soft-400">/</span> : null}
					{item.href ? (
						<Link
							href={item.href}
							className="hover:text-text-strong-950 hover:underline"
						>
							{item.label}
						</Link>
					) : (
						<span className="text-text-strong-950">{item.label}</span>
					)}
				</span>
			))}
		</nav>
	);
}

export function EmptyState({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	return (
		<div className="px-4 py-10 text-center">
			<p className="font-medium text-[13px] text-text-strong-950">{title}</p>
			{description ? (
				<p className="mx-auto mt-1 max-w-sm text-[12px] text-text-sub-600">
					{description}
				</p>
			) : null}
		</div>
	);
}

export function DataTable({
	headers,
	children,
	colSpan,
	loading,
	empty,
}: {
	headers: string[];
	children: React.ReactNode;
	colSpan: number;
	loading?: boolean;
	empty?: boolean;
	emptyTitle?: string;
}) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[640px] text-left text-[13px]">
				<thead>
					<tr className="border-stroke-soft-100 border-b text-[11px] text-text-sub-600 uppercase tracking-wide dark:border-stroke-soft-100/40">
						{headers.map((h) => (
							<th key={h} className="px-4 py-2.5 font-medium">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td className="px-4 py-8 text-text-sub-600" colSpan={colSpan}>
								Loading…
							</td>
						</tr>
					) : empty ? (
						<tr>
							<td colSpan={colSpan}>
								<EmptyState title="Nothing here yet" />
							</td>
						</tr>
					) : (
						children
					)}
				</tbody>
			</table>
		</div>
	);
}
