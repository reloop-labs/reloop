"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKey } from "@reloop/ui/kbd-key";
import { AnimateIn } from "../_shared/animate-in";

const toolbarControlClassName = cn(
	"inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 shadow-none",
	"font-normal text-text-sub-600 text-xs transition duration-200 ease-out",
	"hover:bg-bg-weak-50 hover:text-text-strong-950",
	"dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40",
);

const selectTriggerClassName = cn(
	"relative inline-flex min-h-9 min-w-0 select-none items-center justify-between gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-left text-sm text-text-strong-950 shadow-none outline-none",
	"dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40",
);

const kbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

export function EmailsListToolbar({ mounted }: { mounted: boolean }) {
	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-2">
				<AnimateIn mounted={mounted} delay={0.16} y={10}>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						tabIndex={-1}
						className="h-9 gap-1.5 whitespace-nowrap rounded-xl text-text-strong-950"
					>
						<Button.Icon>
							<Icon name="calendar" className="h-4 w-4" />
						</Button.Icon>
						All time
						<Button.Icon>
							<Icon name="chevron-down" className="h-3.5 w-3.5" />
						</Button.Icon>
					</Button.Root>
				</AnimateIn>

				<AnimateIn mounted={mounted} delay={0.2} y={10}>
					<button
						type="button"
						tabIndex={-1}
						className={cn(selectTriggerClassName, "w-40")}
					>
						<span className="flex min-w-0 flex-1 items-center gap-2 font-medium text-sm text-text-strong-950">
							<Icon name="activity" className="h-4 w-4 shrink-0" />
							<span className="min-w-0 truncate">All Status</span>
						</span>
						<Icon name="chevron-down" className="-me-1 size-4 opacity-70" />
					</button>
				</AnimateIn>

				<AnimateIn mounted={mounted} delay={0.24} y={10}>
					<button
						type="button"
						tabIndex={-1}
						className={cn(selectTriggerClassName, "w-44")}
					>
						<span className="flex min-w-0 flex-1 items-center gap-2 font-medium text-sm text-text-strong-950">
							<Icon
								name="globe"
								className="h-4 w-4 shrink-0 text-text-sub-600"
							/>
							<span className="min-w-0 truncate">All Domains</span>
						</span>
						<Icon name="chevron-down" className="-me-1 size-4 opacity-70" />
					</button>
				</AnimateIn>

				<AnimateIn mounted={mounted} delay={0.28} y={10}>
					<button
						type="button"
						tabIndex={-1}
						className={cn(selectTriggerClassName, "w-44")}
					>
						<span className="flex min-w-0 flex-1 items-center gap-2 font-medium text-sm text-text-strong-950">
							<Icon
								name="key-new"
								className="h-4 w-4 shrink-0 text-text-sub-600"
							/>
							<span className="min-w-0 truncate">All API Keys</span>
						</span>
						<Icon name="chevron-down" className="-me-1 size-4 opacity-70" />
					</button>
				</AnimateIn>

				<AnimateIn mounted={mounted} delay={0.32} y={10} className="ml-auto">
					<div className="flex items-center gap-2">
						<button
							type="button"
							tabIndex={-1}
							className={cn(toolbarControlClassName, "gap-2 px-1.5")}
							aria-label="Refresh sent emails"
						>
							<Icon name="rotate-cw" className="h-3.5 w-3.5 shrink-0" />
							<KbdKey className={kbdClassName}>R</KbdKey>
						</button>
					</div>
				</AnimateIn>
			</div>

			<AnimateIn mounted={mounted} delay={0.34} y={10}>
				<Input.Root size="small" className="w-full rounded-xl">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							readOnly
							tabIndex={-1}
							placeholder="Search subject or sender..."
						/>
						<button
							type="button"
							tabIndex={-1}
							aria-label="Focus search"
							className="shrink-0 cursor-pointer rounded-[5px] outline-none"
						>
							<KbdKey className={kbdClassName}>/</KbdKey>
						</button>
					</Input.Wrapper>
				</Input.Root>
			</AnimateIn>
		</div>
	);
}
