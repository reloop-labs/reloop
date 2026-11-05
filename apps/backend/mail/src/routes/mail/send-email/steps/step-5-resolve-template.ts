import { MailErrors } from "@reloop/be-mail/lib/errors";
import { htmlToText } from "@reloop/be-mail/lib/html-to-text";
import {
	type RecipientVars,
	resolveRecipientVars,
	usesRecipientVars,
} from "@reloop/be-mail/lib/recipient-vars";
import { db } from "@reloop/db/client";
import { fillTripleBraceVars } from "@reloop/db/template-vars";

export async function resolveTemplate_step5({
	organizationId,
	template,
	subject,
	html,
	text,
	recipient,
}: {
	organizationId: string;
	template?: {
		id?: string;
		slug?: string;
		variables?: Record<string, string | number>;
	};
	subject: string;
	html?: string;
	text?: string;
	/** Who the email goes to, for the reserved per-recipient variables. */
	recipient?: {
		from: string;
		to: string | string[];
		replyTo?: string | string[];
	};
}) {
	let finalSubject = subject;
	let finalHtml = html;
	let finalText = text;

	// FIRST_NAME, EMAIL, UNSUBSCRIBE_URL, ... — only looked up when the email
	// actually uses one.
	let resolved: RecipientVars | null = null;
	const resolveReserved = async (): Promise<RecipientVars | null> => {
		if (resolved || !recipient) return resolved;
		const parts = [finalSubject, finalHtml, finalText];
		if (!usesRecipientVars(parts)) return null;
		resolved = await resolveRecipientVars({
			organizationId,
			...recipient,
			parts,
		});
		return resolved;
	};

	if (template && !template.id && !template.slug) {
		throw MailErrors.templateRefRequired();
	}

	if (template?.id || template?.slug) {
		const { id, slug } = template;
		const templateRecord = await db.query.template.findFirst({
			where: (t, { and: dbAnd, eq: dbEq, isNull: dbIsNull }) =>
				dbAnd(
					id ? dbEq(t.id, id) : dbEq(t.slug, slug as string),
					dbEq(t.organizationId, organizationId),
					dbIsNull(t.deletedAt),
				),
		});

		if (!templateRecord) {
			throw id
				? MailErrors.templateNotFound(id)
				: MailErrors.templateSlugNotFound(slug as string);
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

		// 2. Per-recipient values (contact name, unsubscribe link) beat the
		// template's defaults, but an empty one keeps the default.
		const reserved = await resolveReserved();
		for (const [key, value] of Object.entries(reserved?.vars ?? {})) {
			if (value) finalVariables[key] = value;
		}

		// 3. Override with request-specific variables
		if (template.variables) {
			for (const [key, value] of Object.entries(template.variables)) {
				finalVariables[key] = value;
			}
		}

		// 4. Substitute placeholders. Values are HTML-escaped in the HTML body
		// only; subject and text are not HTML.
		if (finalSubject)
			finalSubject = fillTripleBraceVars(finalSubject, finalVariables, {
				html: false,
			});
		if (finalHtml)
			finalHtml = fillTripleBraceVars(finalHtml, finalVariables, {
				html: true,
			});
		if (finalText)
			finalText = fillTripleBraceVars(finalText, finalVariables, {
				html: false,
			});
	}

	// Reserved placeholders still left (raw HTML sends, or empty values) get
	// the recipient's values, so no `{{{unsubscribe_url}}}` goes out as-is.
	const reserved = await resolveReserved();
	if (reserved) {
		if (finalSubject)
			finalSubject = fillTripleBraceVars(finalSubject, reserved.vars, {
				html: false,
			});
		if (finalHtml)
			finalHtml = fillTripleBraceVars(finalHtml, reserved.vars, {
				html: true,
			});
		if (finalText)
			finalText = fillTripleBraceVars(finalText, reserved.vars, {
				html: false,
			});
	}

	if (!finalHtml && !finalText) {
		throw MailErrors.missingEmailBody();
	}

	// HTML-only send: derive the text/plain part so the message goes out as
	// multipart/alternative. Done after template substitution so the text
	// matches the rendered HTML, and before tracking injection so it carries
	// the real link targets rather than redirect URLs.
	if (finalHtml && !finalText?.trim()) {
		finalText = htmlToText(finalHtml) || undefined;
	}

	return {
		finalSubject,
		finalHtml,
		finalText,
		/** List-Unsubscribe headers for an email with an unsubscribe link. */
		recipientHeaders: reserved?.headers ?? {},
	};
}
