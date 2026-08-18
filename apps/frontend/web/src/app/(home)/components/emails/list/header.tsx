"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdKey } from "@reloop/ui/kbd-key";
import { AnimateIn } from "../_shared/animate-in";

const kbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

export function EmailsListHeader({ mounted }: { mounted: boolean }) {
	return (
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div className="space-y-1">
				<AnimateIn mounted={mounted} delay={0.03} y={14}>
					<div className="flex items-center gap-2.5">
						<Icon
							name="mail-send"
							className="h-6 w-6 shrink-0 text-text-strong-950"
						/>
						<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							Email Sent
						</h1>
					</div>
				</AnimateIn>
				<AnimateIn mounted={mounted} delay={0.07} y={10}>
					<p className="text-sm text-text-sub-600">
						Track and monitor your outbound transactional emails.
					</p>
				</AnimateIn>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<AnimateIn mounted={mounted} delay={0.1} y={12}>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						tabIndex={-1}
						className="gap-1.5 rounded-xl text-text-strong-950"
					>
						<Icon name="code" className="h-4 w-4 text-text-sub-600" />
						SDK
						<KbdKey className={cn(kbdClassName, "w-auto min-w-4 px-1")}>
							S
						</KbdKey>
					</Button.Root>
				</AnimateIn>
				<AnimateIn mounted={mounted} delay={0.14} y={12}>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						tabIndex={-1}
						className="gap-1.5 rounded-xl text-text-strong-950"
					>
						Documentation
						<KbdKey className={cn(kbdClassName, "w-auto min-w-4 px-1")}>
							D
						</KbdKey>
					</Button.Root>
				</AnimateIn>
			</div>
		</div>
	);
}
