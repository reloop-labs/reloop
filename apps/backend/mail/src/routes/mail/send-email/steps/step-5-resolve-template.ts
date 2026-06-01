import { MailErrors } from "@reloop/be-mail/lib/errors";
import { db } from "@reloop/db/client";

export async function resolveTemplate_step5({
	organizationId,
	template,
	subject,
	html,
	text,
}: {
	organizationId: string;
	template?: { id: string; variables?: Record<string, string | number> };
	subject: string;
	html?: string;
	text?: string;
}) {
	let finalSubject = subject;
	let finalHtml = html;
	let finalText = text;

	if (template?.id) {
		const templateRecord = await db.query.template.findFirst({
			where: (t, { and: dbAnd, eq: dbEq, isNull: dbIsNull }) =>
				dbAnd(
					dbEq(t.id, template.id),
					dbEq(t.organizationId, organizationId),
					dbIsNull(t.deletedAt),
				),
		});

		if (!templateRecord) {
			throw MailErrors.templateNotFound(template.id);
		}

		const latestPublished = await db.query.templateVersion.findFirst({
			where: (tv, { and: dbAnd, eq: dbEq }) =>
				dbAnd(dbEq(tv.templateId, templateRecord.id), dbEq(tv.isMajor, true)),
			orderBy: (tv, { desc: dbDesc }) => [dbDesc(tv.version)],
		});

		finalSubject = templateRecord.subject || finalSubject;
		finalHtml = latestPublished?.renderedHtml || finalHtml;

		// 1. Populate default fallback values defined on the template
		const finalVariables: Record<string, string | number> = {};
		const templateVariables = (templateRecord.variables as any[]) || [];
		for (const v of templateVariables) {
			if (v && typeof v === "object" && v.name) {
				if (v.defaultValue !== undefined && v.defaultValue !== null) {
					finalVariables[v.name] = v.defaultValue;
				}
			}
		}

		// 2. Override with request-specific variables
		if (template.variables) {
			for (const [key, value] of Object.entries(template.variables)) {
				finalVariables[key] = value;
			}
		}

		// 3. Substitute placeholders in subject, html, and text
		const substitute = (str: string) => {
			let substituted = str;
			for (const [key, value] of Object.entries(finalVariables)) {
				const regex = new RegExp(`{{{\\s*${key}\\s*}}}`, "g");
				substituted = substituted.replace(regex, String(value));
			}
			return substituted;
		};

		if (finalSubject) finalSubject = substitute(finalSubject);
		if (finalHtml) finalHtml = substitute(finalHtml);
		if (finalText) finalText = substitute(finalText);
	}

	if (!finalHtml && !finalText) {
		throw MailErrors.missingEmailBody();
	}

	return { finalSubject, finalHtml, finalText };
}
