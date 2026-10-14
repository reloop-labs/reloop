"use client";

import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatMoment } from "../../run-format";
import { TRIGGER_NODE_ID } from "../../workflow-types";
import type { RunOverlay } from "../node-editor-context";
import { RUN_STATUS, RunBadge, STEP_STATUS } from "./run-status-badge";

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
	<div className="flex min-w-0 flex-col gap-1.5">
		<span className="text-text-soft-400 text-xs">{label}</span>
		<div className="flex min-h-6 items-center text-[13px] text-text-strong-950">
			{children}
		</div>
	</div>
);

/** How the run went at the trigger: when it started and with what payload. */
const TriggerRunCard = ({ run }: { run: RunOverlay }) => {
	const hasPayload = Object.keys(run.trigger.properties).length > 0;
	return (
		<div className="flex flex-col gap-3 px-4 py-3">
			<div className="grid grid-cols-2 gap-4">
				<Field label="Started">{formatMoment(run.enrollment.enrolledAt)}</Field>
				<Field label="Run">
					<RunBadge style={RUN_STATUS[run.enrollment.status]} />
				</Field>
			</div>
			{run.trigger.eventKey ? (
				<div className="flex flex-col gap-1.5">
					<span className="text-text-soft-400 text-xs">Trigger payload</span>
					{hasPayload ? (
						<pre className="max-h-48 overflow-auto rounded-lg bg-bg-weak-50 px-3 py-2.5 font-mono text-[12px] text-text-strong-950 leading-relaxed dark:bg-black">
							{JSON.stringify(run.trigger.properties, null, 2)}
						</pre>
					) : (
						<span className="text-[13px] text-text-sub-600">
							Tracked without properties
						</span>
					)}
				</div>
			) : (
				<span className="text-[13px] text-text-sub-600">
					Enrolled directly, without an event
				</span>
			)}
		</div>
	);
};

/** How the run went at one step; dims steps it never reached. */
const StepRunCard = ({ run, nodeId }: { run: RunOverlay; nodeId: string }) => {
	const step = run.steps[nodeId];
	if (!step) {
		const ended = run.enrollment.status !== "active";
		return (
			<div className="px-4 py-3">
				<Field label="Status">
					<RunBadge
						style={{
							label: ended ? "Not reached" : "Upcoming",
							status: "disabled",
						}}
					/>
				</Field>
			</div>
		);
	}

	const when =
		step.status === "pending"
			? { label: "Runs", at: step.scheduledFor }
			: step.status === "running"
				? { label: "Started", at: step.startedAt ?? step.scheduledFor }
				: { label: "Finished", at: step.finishedAt ?? step.scheduledFor };

	return (
		<div className="flex flex-col gap-3 px-4 py-3">
			<div className="grid grid-cols-2 gap-4">
				<Field label="Status">
					<RunBadge style={STEP_STATUS[step.status]} />
				</Field>
				<Field label={when.label}>{formatMoment(when.at)}</Field>
			</div>
			{step.error ? (
				<p className="flex items-start gap-1.5 text-[13px] text-text-sub-600">
					<Icon
						name="alert-circle"
						className="mt-0.5 size-3.5 shrink-0 text-text-soft-400"
					/>
					{step.error}
				</p>
			) : null}
			{step.emailLogId ? (
				<Link
					href={`/emails/${step.emailLogId}`}
					className="nodrag nopan inline-flex w-fit items-center gap-1 font-medium text-[13px] text-text-strong-950 underline-offset-4 hover:underline"
				>
					View email
					<Icon name="arrow-right" className="size-3.5" />
				</Link>
			) : null}
		</div>
	);
};

export const RunStepCard = ({
	run,
	nodeId,
}: {
	run: RunOverlay;
	nodeId: string;
}) =>
	nodeId === TRIGGER_NODE_ID ? (
		<TriggerRunCard run={run} />
	) : (
		<StepRunCard run={run} nodeId={nodeId} />
	);
