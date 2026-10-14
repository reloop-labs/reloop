"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import { sanitizePreviewHtml } from "#/features/templates/editor/utils/sanitize-preview-html";
import { useNow } from "../../hooks/use-automation-runs";
import type { StepEmail, StepRun } from "../../hooks/use-automations-api";
import { formatCountdown, formatMoment } from "../../run-format";
import { TRIGGER_NODE_ID } from "../../workflow-types";
import type { FrameTone } from "../editors/editor-shell";
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

/** Frame tint for a step: green done, red failed, blue still going. */
export function runStepTone(
	run: RunOverlay,
	nodeId: string,
): FrameTone | undefined {
	const status =
		nodeId === TRIGGER_NODE_ID
			? run.enrollment.status
			: run.steps[nodeId]?.status;
	switch (status) {
		case "completed":
			return "success";
		case "failed":
			return "error";
		case "active":
		case "pending":
		case "running":
			return "progress";
		default:
			return undefined;
	}
}

/** "◌ 4m 32s left", counting down every second while a step waits. */
const CountdownBadge = ({ at }: { at: string }) => {
	const now = useNow(1000);
	const left = new Date(at).getTime() - now;
	return (
		<RunBadge
			style={{
				label: left > 0 ? `${formatCountdown(left)} left` : "Running",
				status: "running",
			}}
			className="mr-4 tabular-nums"
		/>
	);
};

/**
 * Status at the top right of a step: the run's at the trigger, the time left
 * while a step waits, otherwise how the step went.
 */
export const RunStepStatus = ({
	run,
	nodeId,
}: {
	run: RunOverlay;
	nodeId: string;
}) => {
	if (nodeId === TRIGGER_NODE_ID) {
		return (
			<RunBadge style={RUN_STATUS[run.enrollment.status]} className="mr-4" />
		);
	}
	const step = run.steps[nodeId];
	if (step?.status === "pending" && run.enrollment.status === "active") {
		return <CountdownBadge at={step.scheduledFor} />;
	}
	const style = step
		? STEP_STATUS[step.status]
		: {
				label: run.enrollment.status === "active" ? "Upcoming" : "Not reached",
				status: "disabled" as const,
			};
	return <RunBadge style={style} className="mr-4" />;
};

/** The trigger: when the run started and with what payload. */
const TriggerDetails = ({ run }: { run: RunOverlay }) => {
	const hasPayload = Object.keys(run.trigger.properties).length > 0;
	return (
		<div className="flex flex-col gap-3 px-4 py-3">
			<Field label="Started">{formatMoment(run.enrollment.enrolledAt)}</Field>
			{run.trigger.eventKey ? (
				<div className="flex flex-col gap-1.5">
					<span className="text-text-soft-400 text-xs">Trigger payload</span>
					{hasPayload ? (
						<pre className="nowheel max-h-48 overflow-auto rounded-lg bg-bg-weak-50 px-3 py-2.5 font-mono text-[12px] text-text-strong-950 leading-relaxed dark:bg-black">
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

/** When a step started and ended; a delay waits from scheduling until it ends. */
const StepTimes = ({ step }: { step: StepRun }) => {
	const waiting = step.status === "pending";
	if (step.nodeType === "delay") {
		return (
			<div className="grid grid-cols-2 gap-4">
				<Field label="Started">{formatMoment(step.createdAt)}</Field>
				<Field label={waiting ? "Ends" : "Ended"}>
					{formatMoment(step.finishedAt ?? step.scheduledFor)}
				</Field>
			</div>
		);
	}
	if (waiting) {
		return (
			<Field label="Scheduled for">{formatMoment(step.scheduledFor)}</Field>
		);
	}
	return (
		<div className="grid grid-cols-2 gap-4">
			<Field label="Started">
				{formatMoment(step.startedAt ?? step.scheduledFor)}
			</Field>
			{step.finishedAt ? (
				<Field label="Finished">{formatMoment(step.finishedAt)}</Field>
			) : null}
		</div>
	);
};

/** Email width the preview is laid out at, then scaled to fit the step. */
const EMAIL_WIDTH = 600;
const PREVIEW_WIDTH = 360;
const PREVIEW_HEIGHT = 300;

const EmailPreview = ({ html, title }: { html: string; title: string }) => {
	const srcDoc = useMemo(() => sanitizePreviewHtml(html), [html]);
	const scale = PREVIEW_WIDTH / EMAIL_WIDTH;
	return (
		<div
			className="nowheel nodrag overflow-hidden rounded-lg border border-stroke-soft-200 bg-white dark:border-stroke-soft-100/50"
			style={{ height: PREVIEW_HEIGHT }}
		>
			<iframe
				title={title}
				srcDoc={srcDoc}
				// No scripts, forms or navigation: it only shows the email.
				sandbox=""
				style={{
					width: EMAIL_WIDTH,
					height: PREVIEW_HEIGHT / scale,
					transform: `scale(${scale})`,
					transformOrigin: "top left",
				}}
				className="border-0"
			/>
		</div>
	);
};

const EmailRow = ({ label, value }: { label: string; value: ReactNode }) => (
	<div className="grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-2 text-[13px]">
		<span className="text-text-soft-400 text-xs">{label}</span>
		<span className="min-w-0 truncate text-text-strong-950">{value}</span>
	</div>
);

/** The email this step sends the contact: From, To, Subject and the email itself. */
const EmailDetails = ({
	email,
	showProblem,
}: {
	email: StepEmail;
	/** Off once the step failed: its error already says why. */
	showProblem: boolean;
}) => (
	<div className="flex flex-col gap-3">
		<div className="flex flex-col gap-1.5">
			<EmailRow
				label="From"
				value={
					email.from ?? <span className="text-text-soft-400">Not set</span>
				}
			/>
			<EmailRow label="To" value={email.to} />
			<EmailRow label="Subject" value={email.subject || "—"} />
		</div>
		{email.problem && showProblem ? (
			<p className="flex items-start gap-1.5 rounded-lg bg-error-lighter px-2.5 py-2 text-[13px] text-error-base">
				<Icon name="alert-circle" className="mt-0.5 size-3.5 shrink-0" />
				{email.problem}
			</p>
		) : null}
		{email.html ? (
			<EmailPreview html={email.html} title={email.subject || "Email"} />
		) : null}
	</div>
);

/**
 * What happened at a step: its times, the email it sends, why it failed.
 * Nothing for a step the run hasn't reached (its status says Upcoming).
 */
export const RunStepDetails = ({
	run,
	nodeId,
}: {
	run: RunOverlay;
	nodeId: string;
}) => {
	if (nodeId === TRIGGER_NODE_ID) return <TriggerDetails run={run} />;
	const step = run.steps[nodeId];
	const email = run.emails[nodeId];
	if (!step && !email) return null;

	return (
		<div className="flex flex-col gap-3 px-4 py-3">
			{step ? <StepTimes step={step} /> : null}
			{step?.error ? (
				<p
					className={cn(
						"flex items-start gap-1.5 text-[13px]",
						step.status === "failed" ? "text-error-base" : "text-text-sub-600",
					)}
				>
					<Icon name="alert-circle" className="mt-0.5 size-3.5 shrink-0" />
					{step.error}
				</p>
			) : null}
			{email ? (
				<EmailDetails email={email} showProblem={step?.status !== "failed"} />
			) : null}
			{email?.emailId ? (
				<Link
					href={`/emails/${email.emailId}`}
					className="nodrag nopan inline-flex w-fit items-center gap-1 font-medium text-[13px] text-text-strong-950 underline-offset-4 hover:underline"
				>
					View sent email
					<Icon name="arrow-right" className="size-3.5" />
				</Link>
			) : null}
		</div>
	);
};
