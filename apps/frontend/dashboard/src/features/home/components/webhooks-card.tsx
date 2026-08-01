import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useWebhooks } from "#/features/webhooks/components/use-webhooks";

export function WebhooksCard() {
	// Home card only renders 3 rows — avoid pulling the full page list (limit 100).
	const { webhooks, isTotalEmpty } = useWebhooks({ limit: 5 });

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<Link
					href="/webhooks"
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="webhook" className="h-4 w-4 shrink-0" />
					<span>Webhooks</span>
				</Link>

				<div className="flex items-center gap-1.5">
					<Link
						href="/webhooks/create"
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60"
					>
						<Plus className="h-3.5 w-3.5" />
					</Link>
					<Link
						href="/webhooks"
						className="flex h-7 w-7 shrink-0 items-center justify-center text-text-sub-600 transition-transform hover:translate-x-0.5 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
					>
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			</div>

			{/* Body */}
			{!isTotalEmpty && webhooks && webhooks.length > 0 ? (
				<div className="-mt-1.5 h-[200px] divide-y divide-stroke-soft-100 overflow-y-auto rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
						{webhooks.slice(0, 3).map((w) => (
							<Link
								href={`/webhooks/${w.id}`}
								className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
								key={w.id}
							>
								<div className="flex min-w-0 flex-col pr-2">
									<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
										{w.name}
									</span>
									<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
										{w.url}
									</span>
								</div>
								<div className="flex items-center justify-center">
									<span
										className={cn(
											"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
											w.status === "active"
												? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
												: w.status === "paused"
													? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
													: "bg-zinc-50 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
										)}
									>
										{w.status}
									</span>
								</div>
								<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
									{new Date(w.createdAt).toLocaleDateString([], {
										month: "short",
										day: "numeric",
									})}
								</div>
							</Link>
						))}
					</div>
				</div>
			) : (
				<div className="-mt-1.5 flex h-[200px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white px-6 py-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					{/* Icon outline without pill wrapper */}
					<Icon
						name="webhook"
						className="h-6 w-6 shrink-0 text-text-sub-600 dark:text-white/40"
					/>

					{/* Heading */}
					<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
						Receive real-time notifications
					</h4>

					{/* Description */}
					<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
						Deliver instant updates about emails, deliveries, or events to your
						server.
					</p>

					{/* Button */}
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="mt-6 shrink-0 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link href="/webhooks/create">Create webhook</Link>
					</Button.Root>
				</div>
			)}
		</div>
	);
}
