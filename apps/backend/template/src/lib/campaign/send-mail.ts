import { templateConfig } from "@be/template/template.config";
import {
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "@reloop/auth/middleware/types";
import { log } from "evlog";

export async function sendCampaignMail(params: {
	organizationId: string;
	userId: string;
	from: string;
	to: string;
	subject: string;
	html: string;
	text: string;
	replyTo?: string | null;
	tags: { name: string; value: string }[];
	headers?: Record<string, string>;
	templateId?: string | null;
}): Promise<{ emailLogId?: string; messageId?: string }> {
	const body: Record<string, unknown> = {
		from: params.from,
		to: params.to,
		subject: params.subject,
		html: params.html,
		text: params.text,
		tags: params.tags,
	};
	if (params.replyTo) body.reply_to = params.replyTo;
	if (params.headers && Object.keys(params.headers).length > 0) {
		body.headers = params.headers;
	}
	if (params.templateId?.trim()) {
		body.template = { id: params.templateId.trim(), variables: {} };
	}

	const url = `${templateConfig.BASE_URL.replace(/\/$/, "")}/api/mail/v1/send`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"user-agent": "reloop-template-campaigns/1.0",
			[INTERNAL_SECRET_HEADER]: templateConfig.RELOOP_INTERNAL_SECRET,
			[INTERNAL_USER_ID_HEADER]: params.userId,
			[INTERNAL_ORG_ID_HEADER]: params.organizationId,
		},
		body: JSON.stringify(body),
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
			message: "Campaign mail send failed",
			status: res.status,
			detail,
			to: params.to,
		});
		const error = new Error(detail) as Error & { status?: number };
		error.status = res.status;
		throw error;
	}

	return {
		emailLogId: payload.id,
		messageId: payload.messageId,
	};
}
