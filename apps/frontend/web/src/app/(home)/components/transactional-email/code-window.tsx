import type { ReactNode } from "react";

export function CodeWindow({
	file,
	children,
}: {
	file: string;
	children: ReactNode;
}) {
	return (
		<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#161616] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
			<div className="relative flex h-10 items-center justify-center border-stroke-soft-200 border-b px-4 dark:border-white/10">
				<div className="absolute top-1/2 left-4 flex -translate-y-1/2 items-center gap-1.5">
					<span className="size-2.5 rounded-full bg-[#ff5f57]" />
					<span className="size-2.5 rounded-full bg-[#febc2e]" />
					<span className="size-2.5 rounded-full bg-[#28c840]" />
				</div>
				<p className="font-medium text-[12px] text-text-soft-400 dark:text-white/40">
					{file}
				</p>
			</div>
			<pre className="overflow-hidden px-5 py-5 font-mono text-[12.5px] leading-6 sm:text-[13px]">
				{children}
			</pre>
		</div>
	);
}
