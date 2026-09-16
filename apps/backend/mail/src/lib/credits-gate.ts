import { countEmailRecipients } from "@reloop/be-mail/lib/count-recipients";
import { MailErrors } from "@reloop/be-mail/lib/errors";
import {
	type CreditReservation,
	peekSendCredits,
	type ReserveDecision,
	refundSendCredits,
	reserveSendCredits,
} from "@reloop/db/reserve-send-credits";

function throwQuotaError(
	decision: ReserveDecision,
	recipientCount: number,
): never {
	if (decision.ok) {
		throw new Error("throwQuotaError called on an accepted reservation");
	}
	if (decision.reason === "daily" && decision.dailyLimit != null) {
		if (decision.cause === "domain_age") {
			throw MailErrors.domainTooNew({
				used: decision.dailyUsed,
				limit: decision.dailyLimit,
				required: recipientCount,
			});
		}
		throw MailErrors.dailyQuotaExceeded({
			used: decision.dailyUsed,
			limit: decision.dailyLimit,
			required: recipientCount,
		});
	}
	throw MailErrors.quotaExceeded({
		remaining: decision.remaining,
		required: recipientCount,
		monthlyCredits: decision.monthlyCredits,
	});
}

/**
 * Fail-fast peek. Concurrent senders can still all pass this; callers must
 * `reserveCreditsForSend` before creating logs or calling KumoMTA.
 */
export async function assertHasCredits({
	organizationId,
	body,
}: {
	organizationId: string;
	body: {
		to: string | string[];
		cc?: string | string[];
		bcc?: string | string[];
	};
}): Promise<{ creditsRemaining: number; recipientCount: number }> {
	const recipientCount = countEmailRecipients(body);
	const decision = await peekSendCredits({ organizationId, recipientCount });
	if (!decision.ok) throwQuotaError(decision, recipientCount);
	return {
		creditsRemaining: decision.remaining,
		recipientCount,
	};
}

export async function reserveCreditsForSend({
	organizationId,
	body,
	domainRegisteredAt,
	applyDomainAgeOverlay,
}: {
	organizationId: string;
	body: {
		to: string | string[];
		cc?: string | string[];
		bcc?: string | string[];
	};
	domainRegisteredAt?: Date | null;
	applyDomainAgeOverlay?: boolean;
}): Promise<CreditReservation | null> {
	const recipientCount = countEmailRecipients(body);
	if (recipientCount <= 0) return null;

	const decision = await reserveSendCredits({
		organizationId,
		recipientCount,
		domainRegisteredAt,
		applyDomainAgeOverlay,
	});
	if (!decision.ok) throwQuotaError(decision, recipientCount);
	return decision.reservation ?? null;
}

export async function refundCreditsForFailedSend(
	reservation: CreditReservation | null,
): Promise<void> {
	if (!reservation) return;
	await refundSendCredits({ reservation });
}
