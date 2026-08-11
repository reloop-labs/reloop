import { cn } from "@reloop/ui/cn";
import {
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";

/**
 * Blog / MDX tables styled like the dashboard API key list card:
 * soft rounded header lip + overlapping white body card with row dividers.
 */

type PropsWithChildren = { children?: ReactNode };

function isReactElement(child: ReactNode): child is ReactElement<PropsWithChildren> {
	return isValidElement(child);
}

function isType(
	child: ReactNode,
	components: Array<((props: never) => ReactNode) | string>,
): child is ReactElement<PropsWithChildren> {
	if (!isReactElement(child)) return false;
	return components.some((c) => child.type === c);
}

export function MdxThead(props: React.ComponentProps<"thead">) {
	return <thead {...props} />;
}

export function MdxTbody(props: React.ComponentProps<"tbody">) {
	return <tbody {...props} />;
}

export function MdxTr(props: React.ComponentProps<"tr">) {
	return <tr {...props} />;
}

export function MdxTh({ className, ...props }: React.ComponentProps<"th">) {
	return <th className={cn(className)} {...props} />;
}

export function MdxTd({ className, ...props }: React.ComponentProps<"td">) {
	return <td className={cn(className)} {...props} />;
}

function mapCells(
	children: ReactNode,
	className: string,
	keyPrefix: string,
): ReactNode[] {
	return Children.toArray(children).flatMap((child, index) => {
		if (!isType(child, [MdxTh, MdxTd, "th", "td"])) {
			// remark-gfm may still emit plain "th"/"td" strings as types
			if (
				isReactElement(child) &&
				(child.type === "th" || child.type === "td")
			) {
				return (
					<div key={child.key ?? `${keyPrefix}-${index}`} className={className}>
						{child.props.children}
					</div>
				);
			}
			return [];
		}
		return (
			<div key={child.key ?? `${keyPrefix}-${index}`} className={className}>
				{child.props.children}
			</div>
		);
	});
}

export function MdxTable({
	children,
	className,
	...props
}: React.ComponentProps<"table">) {
	const kids = Children.toArray(children);
	const thead = kids.find((c) => isType(c, [MdxThead, "thead"]));
	const tbody = kids.find((c) => isType(c, [MdxTbody, "tbody"]));

	// Fallback: plain bordered card if structure is unexpected
	if (!thead && !tbody) {
		return (
			<div className="my-6 w-full overflow-x-auto">
				<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
					<table
						className={cn("my-0! w-full border-collapse text-[13px]", className)}
						{...props}
					>
						{children}
					</table>
				</div>
			</div>
		);
	}

	const headerRow = thead
		? Children.toArray(thead.props.children).find((c) =>
				isType(c, [MdxTr, "tr"]),
			)
		: undefined;

	const headerCells = headerRow
		? mapCells(
				headerRow.props.children,
				"min-w-0 font-medium text-text-sub-600 text-xs dark:text-white/55",
				"h",
			)
		: [];

	const bodyRows = tbody
		? Children.toArray(tbody.props.children).flatMap((row, rowIndex) => {
				if (!isType(row, [MdxTr, "tr"])) return [];
				const cells = mapCells(
					row.props.children,
					"min-w-0 text-[13px] text-text-strong-950 leading-relaxed dark:text-white",
					`r${rowIndex}`,
				);
				return (
					<div
						key={row.key ?? `row-${rowIndex}`}
						className="grid w-full items-start gap-x-4 px-4 py-3 transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]"
						style={{
							gridTemplateColumns: `repeat(${Math.max(cells.length, 1)}, minmax(0, 1fr))`,
						}}
					>
						{cells}
					</div>
				);
			})
		: [];

	const colCount = Math.max(headerCells.length, 1);

	return (
		<div className="my-6 w-full overflow-x-auto text-paragraph-sm">
			{/* Soft header lip — matches dashboard API key list */}
			<div
				className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
				style={{
					gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
					columnGap: "1rem",
				}}
			>
				{headerCells}
			</div>

			{/* White body card, overlaps the header lip */}
			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				{bodyRows}
			</div>
		</div>
	);
}

/** Inline code chips — same feel as API key prefix pills. */
export function MdxInlineCode({
	className,
	...props
}: React.ComponentProps<"code">) {
	// Fenced blocks use <pre><code class="language-…">; leave those unstyled
	// (our `pre` override turns them into CodeBlock before this matters, but be safe).
	if (typeof className === "string" && className.includes("language-")) {
		return <code className={className} {...props} />;
	}

	return (
		<code
			className={cn(
				"rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono font-semibold text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-100 dark:bg-white/5 dark:text-white/70 dark:ring-stroke-soft-100/40",
				className,
			)}
			{...props}
		/>
	);
}
