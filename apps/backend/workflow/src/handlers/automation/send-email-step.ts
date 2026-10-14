import type { SendEmailNodeData } from "@be/workflow/lib/automation/graph";
import { resolveStepEmail } from "@be/workflow/lib/automation/resolve-email";
import { StepError } from "@be/workflow/lib/automation/step-error";
import { workflowConfig } from "@be/workflow/workflow.config";
import {
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "@reloop/auth/middleware/types";
import { log } from "evlog";

export async function sendAutomationEmail(params: {
	organizationId: string;
	userId: string;
	contact: {
		email: string;
		firstName?: string | null;
		lastName?: string | null;
	};
	nodeData: SendEmailNodeData;
	tags: { name: string; value: string }[];
}): Promise<{ emailLogId?: string; messageId?: string }> {
	const resolved = await resolveStepEmail({
		organizationId: params.organizationId,
		nodeData: params.nodeData,
		contact: params.contact,
	});
	const { to, subject, from } = resolved;
	if (!from) {
		throw new StepError(
			"This step has no From address. Pick one in the editor.",
			{
				retryable: false,
			},
		);
	}

	const body: Record<string, unknown> = {
		from,
		to,
		subject,
		tags: params.tags,
	};

	const templateId = params.nodeData.templateId?.trim();
	if (templateId) {
		// The template is the body. HTML older steps kept on the step would
		// only end up in the email log, so it isn't sent.
		body.template = { id: templateId, variables: {} };
	} else {
		body.html =
			params.nodeData.html?.trim() ||
			`<p>${escapeHtml(subject)}</p><p>Hi ${escapeHtml(params.contact.firstName || "there")},</p>`;
		body.text =
			params.nodeData.text?.trim() ||
			`${subject}\n\nHi ${params.contact.firstName || "there"},`;
	}

	const url = `${workflowConfig.BASE_URL.replace(/\/$/, "")}/api/mail/v1/send`;
	const secret = workflowConfig.RELOOP_INTERNAL_SECRET;

	const res = await fetch(url, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"user-agent": "reloop-workflow-automation/1.0",
			[INTERNAL_SECRET_HEADER]: secret,
			[INTERNAL_USER_ID_HEADER]: params.userId,
			[INTERNAL_ORG_ID_HEADER]: params.organizationId,
		},
		body: JSON.stringify(body),
	}).catch((cause: unknown) => {
		throw new StepError("Couldn’t reach the mail service.", {
			retryable: true,
			cause,
		});
	});

	const payload = (await res.json().catch(() => ({}))) as {
		id?: string;
		messageId?: string;
		message?: string;
		why?: string;
	};

	if (!res.ok) {
		const detail =
			payload.message || payload.why || `Mail API returned ${res.status}`;
		log.error({
			message: "Automation send email failed",
			status: res.status,
			detail,
			why: payload.why,
			to,
			subject,
		});
		// 4xx explains what to fix (e.g. an unverified domain), so show it.
		// 5xx is our problem: never show its internals.
		if (res.status >= 500) {
			throw new StepError(
				"The email couldn’t be sent because of a problem on our side.",
				{
					retryable: true,
				},
			);
		}
		const reason = [payload.message?.replace(/\.$/, ""), payload.why]
			.filter(Boolean)
			.join(". ");
		throw new StepError(reason || "The mail service rejected this email.", {
			retryable: res.status === 429,
		});
	}

	return {
		emailLogId: payload.id,
		messageId: payload.messageId,
	};
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
