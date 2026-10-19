"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import type { Workflow } from "../../workflow-types";
import { SettingSwitchRow, useReentry } from "../reentry-setting";

/**
 * On a run that re-entry cancelled: why it stopped, the run that replaced it,
 * and the switch to let runs overlap instead.
 */
export const ReplacedRunNotice = ({
	workflow,
	replacedBy,
	onViewReplacement,
}: {
	workflow: Workflow;
	replacedBy: string;
	onViewReplacement: (enrollmentId: string) => void;
}) => {
	const reentry = useReentry(workflow);

	return (
		<div className="absolute top-6 right-6 z-20 w-[360px] max-w-[calc(100%-3rem)] rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-[#17171c] dark:text-white">
			<div className="flex items-start gap-3">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 dark:bg-white/10">
					<Icon
						name="refresh-cw"
						className="h-4 w-4 text-text-sub-600 dark:text-white/80"
					/>
				</span>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-[14px] leading-snug">
						Replaced by a newer run
					</p>
					<p className="mt-1 text-[13px] text-text-sub-600 leading-snug dark:text-white/60">
						This contact triggered the automation again, so this run was
						cancelled and a fresh one started.
					</p>
					<FancyButton.Root
						variant="basic"
						size="xsmall"
						onClick={() => onViewReplacement(replacedBy)}
						className="mt-3"
					>
						View newer run
					</FancyButton.Root>
				</div>
			</div>
			{reentry.value !== "once" ? (
				<SettingSwitchRow
					className="-mx-1.5 mt-3 w-[calc(100%+0.75rem)]"
					label="Cancel the run in progress"
					description={
						reentry.value === "restart"
							? "Turn off to let runs overlap, so each one finishes on its own."
							: "Off: new runs now overlap instead of cancelling this way."
					}
					checked={reentry.value === "restart"}
					pending={reentry.pending}
					onCheckedChange={(on) =>
						void reentry.set(on ? "restart" : "parallel")
					}
				/>
			) : null}
		</div>
	);
};
