import {
	BATCH_SEND_CONCURRENCY,
	type BatchValidationMode,
	deriveBatchItemIdempotencyKey,
	mapWithConcurrency,
	toBatchItemError,
} from "@reloop/be-mail/lib/batch";
import { countEmailRecipients } from "@reloop/be-mail/lib/count-recipients";
import { assertHasCreditsFor } from "@reloop/be-mail/lib/credits-gate";
import { runOutboundGuard } from "@reloop/be-mail/lib/outbound-guard";
import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { createError, log } from "evlog";
import { sendEmailController } from "./send-email.controllers";
import {
	checkApiKeyScope_step1b,
	parseFromAddress_step1,
	verifyDomainAuth_step2,
} from "./steps";

type SendContext = Omit<
	Parameters<typeof sendEmailController>[0],
	"body" | "idempotencyKey" | "onReplay"
>;

/** Re-throw a per-email failure with its index so strict callers know which. */
function withIndex(index: number, error: unknown): Error {
	const item = toBatchItemError(index, error);
	return createError({
		status: item.status ?? 400,
		message: `Email at index ${index}: ${item.message}`,
		why: item.why ?? "One email in the batch failed validation",
		fix:
			item.fix ??
			"Fix that email and resend the batch, or send with x-batch-validation: permissive to skip invalid emails",
	});
}

/**
 * Side-effect-free checks run on every email before anything is sent, so a
 * strict batch with one bad email sends nothing. Mirrors the cheap gates at
 * the top of the single-send pipeline; the full pipeline still runs per email.
 */
async function preflight({
	emails,
	ctx,
}: {
	emails: MailModel.SendBatchBody;
	ctx: SendContext;
}): Promise<Map<number, unknown>> {
	const failures = new Map<number, unknown>();
	const domainChecks = new Map<string, Promise<unknown>>();

	await Promise.all(
		emails.map(async (email, index) => {
			try {
				if (!ctx.useInternalInject && ctx.apiKeyId) {
					await checkApiKeyScope_step1b({
						apiKeyId: ctx.apiKeyId,
						from: email.from,
					});
				}
				const { domainName } = parseFromAddress_step1(email.from);
				runOutboundGuard({
					from: email.from,
					to: email.to,
					cc: email.cc,
					bcc: email.bcc,
					subject: email.subject,
					html: email.html,
					text: email.text,
					headers: email.headers,
					replyTo: email.reply_to,
					attachments: email.attachments,
				});
				// One lookup per sending domain, shared across the batch.
				let check = domainChecks.get(domainName);
				if (!check) {
					check = verifyDomainAuth_step2({
						organizationId: ctx.organizationId,
						domainName,
					});
					domainChecks.set(domainName, check);
				}
				await check;
			} catch (error) {
				failures.set(index, error);
			}
		}),
	);

	return failures;
}

export async function sendBatchController({
	emails,
	mode,
	idempotencyKey,
	ctx,
}: {
	emails: MailModel.SendBatchBody;
	mode: BatchValidationMode;
	idempotencyKey?: string | null;
	ctx: SendContext;
}): Promise<MailModel.SendBatchResponse> {
	const failures = await preflight({ emails, ctx });

	if (mode === "strict" && failures.size > 0) {
		const index = Math.min(...failures.keys());
		throw withIndex(index, failures.get(index));
	}

	const sendable = emails
		.map((email, index) => ({ email, index }))
		.filter(({ index }) => !failures.has(index));

	// Strict batches are all-or-nothing on quota: fail before the first send
	// rather than running out halfway. Permissive batches let each email's
	// own reservation decide.
	if (mode === "strict") {
		await assertHasCreditsFor({
			organizationId: ctx.organizationId,
			recipientCount: sendable.reduce(
				(sum, { email }) => sum + countEmailRecipients(email),
				0,
			),
		});
	}

	const settled = await mapWithConcurrency(
		sendable,
		BATCH_SEND_CONCURRENCY,
		({ email, index }) =>
			sendEmailController({
				...ctx,
				body: email,
				idempotencyKey: deriveBatchItemIdempotencyKey({
					headerKey: idempotencyKey,
					itemKey: email.idempotency_key,
					index,
				}),
			}),
	);

	const data: MailModel.SendBatchResponse["data"] = [];
	settled.forEach((result, i) => {
		const { index } = sendable[i] as { index: number };
		if (result.status === "fulfilled") {
			data.push({
				index,
				id: result.value.id,
				messageId: result.value.messageId,
				status: result.value.status,
			});
		} else {
			failures.set(index, result.reason);
		}
	});

	const errors = [...failures.entries()]
		.sort(([a], [b]) => a - b)
		.map(([index, error]) => toBatchItemError(index, error));

	log.info({
		message: "Batch send completed",
		organizationId: ctx.organizationId,
		mode,
		requested: emails.length,
		accepted: data.length,
		failed: errors.length,
	});

	// Nothing went out: answer with a real error status instead of a 200
	// with an empty data array.
	if (data.length === 0) {
		const index = Math.min(...failures.keys());
		throw withIndex(index, failures.get(index));
	}

	return { data, errors };
}
