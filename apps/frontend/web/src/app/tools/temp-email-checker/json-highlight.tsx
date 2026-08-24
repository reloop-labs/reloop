import { cn } from "@reloop/ui/cn";
import type { ReactNode } from "react";

const JSON_TOKEN =
	/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;

export function highlightJson(code: string): ReactNode[] {
	const out: ReactNode[] = [];
	let last = 0;
	let key = 0;

	for (const match of code.matchAll(JSON_TOKEN)) {
		const start = match.index ?? 0;
		if (start > last) out.push(code.slice(last, start));

		const [text, str, colon, literal, number] = match;
		const isKey = Boolean(str && colon);

		out.push(
			<span
				key={`j${key++}`}
				className={cn(
					isKey && "text-white",
					!isKey && str && "text-[#4ea1ff]",
					literal && "text-white/45",
					number && "text-[#4ea1ff]",
				)}
			>
				{text}
			</span>,
		);
		last = start + text.length;
	}

	if (last < code.length) out.push(code.slice(last));
	return out;
}

export function RawJsonBlock({
	value,
	className,
}: {
	value: unknown;
	className?: string;
}) {
	const code =
		typeof value === "string" ? value : JSON.stringify(value, null, 2);

	return (
		<div className={cn("overflow-hidden rounded-xl bg-black", className)}>
			<pre className="overflow-x-auto p-4 font-mono text-[13px] text-white/70 leading-[1.7] sm:p-5">
				<code>{highlightJson(code)}</code>
			</pre>
		</div>
	);
}
