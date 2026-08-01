import type { SendEmailNodeData } from "@be/workflow/lib/automation/graph";
import { workflowConfig } from "@be/workflow/workflow.config";
import {
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "@reloop/auth/middleware/types";
import { log } from "evlog";

function interpolate(
	template: string,
	vars: Record<string, string | null | undefined>,
): string {
	return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
		const value = vars[key];
		return value == null ? "" : String(value);
	});
}

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
	const vars: Record<string, string | null | undefined> = {
		"contact.email": params.contact.email,
		"contact.firstName": params.contact.firstName ?? "",
		"contact.lastName": params.contact.lastName ?? "",
		email: params.contact.email,
		firstName: params.contact.firstName ?? "",
		lastName: params.contact.lastName ?? "",
	};

	const to = interpolate(params.nodeData.to || "{{contact.email}}", vars);
	const subject = interpolate(params.nodeData.subject, vars);
	const from = params.nodeData.from?.trim();
	if (!from) {
		throw new Error("Send email step is missing a From address");
	}

	const html =
		params.nodeData.html?.trim() ||
		`<p>${escapeHtml(subject)}</p><p>Hi ${escapeHtml(params.contact.firstName || "there")},</p>`;
	const text =
		params.nodeData.text?.trim() ||
		`${subject}\n\nHi ${params.contact.firstName || "there"},`;

	const body: Record<string, unknown> = {
		from,
		to,
		subject,
		html,
		text,
		tags: params.tags,
	};

	if (params.nodeData.templateId?.trim()) {
		body.template = {
			id: params.nodeData.templateId.trim(),
			variables: {},
		};
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
			to,
			subject,
		});
		throw new Error(detail);
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
