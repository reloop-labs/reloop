"use client";

import { Icon } from "@reloop/ui/icon";
import { ArrowRight } from "lucide-react";
import { siExpress, siHono, siNestjs, siNextdotjs } from "simple-icons";

const frameworkIntegrations = [
	{
		name: "Next.js App Router",
		desc: "Send transactional emails inside server actions and verify DKIM using API routes.",
		icon: siNextdotjs,
	},
	{
		name: "Express REST API",
		desc: "Integrate outbound email delivery and incoming webhook logs with Express middleware.",
		icon: siExpress,
	},
	{
		name: "NestJS Module",
		desc: "Inject a global Reloop client provider module into asynchronous worker queues.",
		icon: siNestjs,
	},
	{
		name: "Hono Middleware",
		desc: "Edge-ready email hooks and webhook handlers for serverless and worker runtimes.",
		icon: siHono,
	},
];

export function FrameworkIntegrationsCard() {
	return (
		<div className="group flex w-full flex-col">
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<span className="flex items-center gap-2 font-medium text-sm text-text-sub-600 dark:text-white/60">
					<Icon name="modules" className="h-4 w-4 shrink-0" />
					<span>Framework Integrations</span>
				</span>
			</div>

			<div className="-mt-1.5 rounded-xl border border-stroke-soft-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
				<div className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2 lg:grid-cols-1">
					{frameworkIntegrations.map((item) => (
						<div
							key={item.name}
							className="group/tile flex cursor-pointer items-center gap-2.5 border-stroke-soft-100/50 border-b py-2.5 transition-colors last:border-b-0 dark:border-white/5"
						>
							<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded">
								<svg
									role="img"
									viewBox="0 0 24 24"
									className="h-4 w-4 shrink-0"
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
									style={{ color: `#${item.icon.hex}` }}
								>
									<path d={item.icon.path} />
								</svg>
							</div>

							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between gap-1">
									<span className="font-semibold text-text-strong-950 text-xs group-hover/tile:underline dark:text-white">
										{item.name}
									</span>
									<ArrowRight className="h-3 w-3 shrink-0 text-text-sub-400 opacity-0 transition-all group-hover/tile:text-text-strong-950 group-hover/tile:opacity-100" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
