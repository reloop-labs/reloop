import { MailErrors } from "@reloop/be-mailing/lib/errors";
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

		const latestVersion = await db.query.templateVersion.findFirst({
			where: (tv, { eq: dbEq }) => dbEq(tv.templateId, templateRecord.id),
			orderBy: (tv, { desc: dbDesc }) => [dbDesc(tv.version)],
		});

		finalSubject = templateRecord.subject || finalSubject;
		finalHtml = latestVersion?.renderedHtml || finalHtml;

		if (template.variables) {
			const substitute = (str: string) => {
				let substituted = str;
				for (const [key, value] of Object.entries(template.variables!)) {
					const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
					substituted = substituted.replace(regex, String(value));
				}
				return substituted;
			};
			if (finalSubject) finalSubject = substitute(finalSubject);
			if (finalHtml) finalHtml = substitute(finalHtml);
			if (finalText) finalText = substitute(finalText);
		}
	}

	if (!finalHtml && !finalText) {
		throw MailErrors.missingEmailBody();
	}

	return { finalSubject, finalHtml, finalText };
}
