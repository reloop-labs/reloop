import type { Job } from "bullmq";
import { createError } from "evlog";
import type { WorkflowJobData } from "./workflow.queue";

export type WorkflowJob = Job<WorkflowJobData>;

export function isLastAttempt(job: WorkflowJob): boolean {
	return job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
}

export async function logJob(job: WorkflowJob, message: string): Promise<void> {
	await job.log(message);
}

export function createWorkflowError({
	message,
	why,
	fix,
	status = 500,
}: {
	message: string;
	why: string;
	fix: string;
	status?: number;
}) {
	return createError({
		status,
		message,
		why,
		fix,
	});
}

/**
 * Default workflow failure flow after the handler has persisted domain state:
 * - final attempt → job.log with fix, return (do not throw)
 * - otherwise → job.log + throw createWorkflowError for BullMQ retry
 */
export async function failJobOrRetry({
	job,
	isLastAttempt: lastAttempt,
	message,
	why,
	fix,
	status = 500,
}: {
	job: WorkflowJob;
	isLastAttempt: boolean;
	message: string;
	why: string;
	fix: string;
	status?: number;
}): Promise<void> {
	if (lastAttempt) {
		await logJob(job, `${message} (final attempt): ${why}. Fix: ${fix}`);
		return;
	}

	await logJob(job, `${message} — will retry: ${why}`);
	throw createWorkflowError({ message, why, fix, status });
}
