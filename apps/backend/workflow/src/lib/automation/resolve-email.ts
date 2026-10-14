import type { SendEmailNodeData } from "@be/workflow/lib/automation/graph";
import { db } from "@reloop/db/client";
import type { AutomationGraph } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export type StepContact = {
	email: string;
	firstName?: string | null;
	lastName?: string | null;
};

/** What a send_email step sends to one contact. */
export type ResolvedStepEmail = {
	from: string | null;
	to: string;
	subject: string;
	templateId: string | null;
	templateName: string | null;
	/** The template's published HTML; null when it has none yet. */
	html: string | null;
};

export function interpolate(
	template: string,
	vars: Record<string, string | null | undefined>,
): string {
	return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
		const value = vars[key];
		return value == null ? "" : String(value);
	});
}

export function contactVars(contact: StepContact) {
	return {
		"contact.email": contact.email,
		"contact.firstName": contact.firstName ?? "",
		"contact.lastName": contact.lastName ?? "",
		email: contact.email,
		firstName: contact.firstName ?? "",
		lastName: contact.lastName ?? "",
	};
}

/** `{{{ name }}}` placeholders filled with the template variables' defaults. */
function fillDefaults(html: string, variables: unknown): string {
	if (!Array.isArray(variables)) return html;
	let out = html;
	for (const v of variables) {
		if (!v || typeof v !== "object") continue;
		const { name, defaultValue } = v as {
			name?: string;
			defaultValue?: unknown;
		};
		if (!name || defaultValue == null) continue;
		const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		out = out.replace(
			new RegExp(`{{{\\s*${escaped}\\s*}}}`, "g"),
			String(defaultValue),
		);
	}
	return out;
}

/**
 * Works out From, To, Subject and HTML the way the send does. With a
 * template, its From, subject and published HTML win (the mail service
 * applies the subject and HTML); the step's own values are fallbacks.
 */
export async function resolveStepEmail(params: {
	organizationId: string;
	nodeData: SendEmailNodeData;
	contact: StepContact;
}): Promise<ResolvedStepEmail> {
	const vars = contactVars(params.contact);
	const templateId = params.nodeData.templateId?.trim() || null;
	let subject = interpolate(params.nodeData.subject ?? "", vars);
	let from = params.nodeData.from?.trim() || null;
	let templateName: string | null = null;
	let html: string | null = params.nodeData.html?.trim() || null;

	if (templateId) {
		const template = await db.query.template.findFirst({
			where: and(
				eq(schema.template.id, templateId),
				eq(schema.template.organizationId, params.organizationId),
				isNull(schema.template.deletedAt),
			),
		});
		if (template) {
			templateName = template.name;
			subject = template.subject || subject;
			const published = await db.query.templateVersion.findFirst({
				where: (tv, { and: dbAnd, eq: dbEq }) =>
					dbAnd(dbEq(tv.templateId, template.id), dbEq(tv.isMajor, true)),
				orderBy: (tv, { desc }) => [desc(tv.version)],
			});
			// The template's From is what the editor shows, so it wins; a From
			// on the step (older steps kept one) only fills in when it has none.
			from = published?.fromEmail?.trim() || from;
			html = published?.renderedHtml
				? fillDefaults(published.renderedHtml, template.variables)
				: null;
		}
	}

	return {
		from,
		to: interpolate(params.nodeData.to || "{{contact.email}}", vars),
		subject,
		templateId,
		templateName,
		html,
	};
}

/** The domain part of "Name <a@b.com>" or "a@b.com", lowercased. */
export function domainOf(address: string): string | null {
	const email = address.match(/<([^>]+)>/)?.[1] ?? address;
	const at = email.lastIndexOf("@");
	return at === -1
		? null
		: email
				.slice(at + 1)
				.trim()
				.toLowerCase() || null;
}

/** Why this From can't send for the organization, or null when it can. */
export async function fromAddressProblem(
	organizationId: string,
	from: string | null,
): Promise<string | null> {
	if (!from) return "It has no From address.";
	const name = domainOf(from);
	if (!name) return `Its From address "${from}" isn't a valid email address.`;
	const owned = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.organizationId, organizationId),
			eq(schema.domain.domain, name),
			isNull(schema.domain.deletedAt),
		),
		columns: { id: true },
	});
	return owned
		? null
		: `It sends from ${from}, but ${name} isn't one of your domains.`;
}

/**
 * Send steps whose From can't send for the organization, as readable lines.
 * Checked on activate so a typo fails there instead of on every contact.
 */
export async function sendStepProblems(
	organizationId: string,
	graph: AutomationGraph,
): Promise<string[]> {
	const problems: string[] = [];
	for (const node of graph.nodes) {
		if (node.type !== "send_email") continue;
		const email = await resolveStepEmail({
			organizationId,
			nodeData: (node.data ?? {}) as SendEmailNodeData,
			contact: { email: "contact@example.com" },
		});
		const problem = await fromAddressProblem(organizationId, email.from);
		if (problem) {
			const label = email.templateName ?? node.id;
			problems.push(`Send email step "${label}": ${problem}`);
		}
	}
	return problems;
}
