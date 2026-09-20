"use client";

import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import { cn } from "@reloop/fe-docs/lib/cn";

export function DemoHover() {
	return (
		<div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col justify-center px-6 py-16">
			<div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
				<TransitionDemo smooth />
				<div
					aria-hidden
					className="h-px w-full bg-black/10 lg:h-auto lg:w-px dark:bg-white/10"
				/>
				<TransitionDemo smooth={false} />
			</div>
		</div>
	);
}

const TRANSITION_CARDS = [
	{ icon: "siNodedotjs", title: "Nodemailer" },
	{ icon: "siPython", title: "Python SMTP" },
	{ icon: "siGo", title: "Go SMTP" },
	{ icon: "siPhp", title: "PHP SMTP" },
	{ icon: "siRuby", title: "Ruby SMTP" },
	{ icon: "siRust", title: "Rust SMTP" },
];

function TransitionDemo({ smooth }: { smooth: boolean }) {
	return (
		<div className="flex flex-col rounded-3xl bg-bg-white-0 p-8 dark:bg-black">
			<p className="m-0 text-center font-bold text-2xl tracking-tight">
				{smooth ? "WITH TRANSITION" : "NO TRANSITION"}
			</p>
			<div className="mt-8 grid grid-cols-2 gap-4">
				{TRANSITION_CARDS.map((card) => (
					<div
						key={card.title}
						className={cn(
							"flex cursor-pointer flex-col gap-4 rounded-2xl border-2 border-transparent bg-bg-white-0 p-4 shadow-[inset_0_0_0_1px_var(--color-stroke-soft-100)] hover:border-black hover:bg-black/[0.02] hover:shadow-none dark:bg-zinc-950 dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-stroke-soft-100)_40%,transparent)] dark:hover:border-white dark:hover:bg-white/[0.02] dark:hover:shadow-none",
							smooth && "transition-all duration-300",
						)}
					>
						<div className="text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:group-hover:text-white">
							<SimpleIcon name={card.icon} size={16} />
						</div>
						<p className="m-0 font-semibold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
							{card.title}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
