import { mailConfig } from "@reloop/be-mail/mail.config";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import {
	extractSenderMailbox,
	listUnsubscribeHeaders,
	mailtoUnsubscribeUrl,
	oneClickUnsubscribeUrl,
	resolveUnsubscribeBase,
	signPreferencesToken,
	unsubscribePageUrl,
} from "@reloop/db/unsubscribe";
import { and, eq, sql } from "drizzle-orm";
import { log } from "evlog";

/**
 * Reserved template variables Reloop fills per recipient, so templates work
 * the same whether they go out through the API, an automation or a campaign:
 *
 *   {{{FIRST_NAME}}} {{{LAST_NAME}}} {{{EMAIL}}} {{{UNSUBSCRIBE_URL}}}
 *
 * `unsubscribe_url` (what the template editor's Footer and unsubscribe link
 * insert) is an alias of UNSUBSCRIBE_URL.
 */
const RESERVED_VAR_RE =
	/\{\{\{\s*(FIRST_NAME|LAST_NAME|EMAIL|UNSUBSCRIBE_URL|unsubscribe_url)\s*\}\}\}/;
const UNSUBSCRIBE_VAR_RE =
	/\{\{\{\s*(UNSUBSCRIBE_URL|unsubscribe_url)\s*\}\}\}/;

const DEFAULT_PREFERENCES_SECRET =
	"reloop-preferences-secret-key-change-in-prod";

export type RecipientVars = {
	/** Values for the reserved placeholders. Empty when unknown. */
	vars: Record<string, string>;
	/** List-Unsubscribe headers to add when the email has an unsubscribe link. */
	headers: Record<string, string>;
};

/** True when any of `parts` uses a reserved per-recipient placeholder. */
export function usesRecipientVars(
	parts: Array<string | null | undefined>,
): boolean {
	return parts.some((part) => Boolean(part && RESERVED_VAR_RE.test(part)));
}

function canSignTokens(): boolean {
	// The contacts service refuses to start in production with the default
	// secret, so a token signed with it would never verify.
	return (
		mailConfig.NODE_ENV !== "production" ||
		mailConfig.PREFERENCES_SECRET !== DEFAULT_PREFERENCES_SECRET
	);
}

function firstAddress(value: string | string[] | undefined): string | null {
	if (!value) return null;
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Work out the reserved variables for one send. Personal values (names and
 * a signed one-click unsubscribe link) need exactly one recipient who is a
 * contact of the organization; anyone else gets a mailto unsubscribe link to
 * the sender, so the link is never empty or a raw placeholder.
 */
export async function resolveRecipientVars(params: {
	organizationId: string;
	from: string;
	to: string | string[];
	replyTo?: string | string[];
	parts: Array<string | null | undefined>;
}): Promise<RecipientVars> {
	const recipients = Array.isArray(params.to) ? params.to : [params.to];
	const single =
		recipients.length === 1 ? extractSenderMailbox(recipients[0] ?? "") : null;
	const replyTo = firstAddress(params.replyTo);

	const vars: Record<string, string> = {
		FIRST_NAME: "",
		LAST_NAME: "",
		EMAIL: single ?? "",
	};

	let contact:
		| { id: string; firstName: string | null; lastName: string | null }
		| undefined;
	if (single) {
		contact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.organizationId, params.organizationId),
				sql`lower(${schema.contact.email}) = ${single}`,
			),
			columns: { id: true, firstName: true, lastName: true },
		});
		vars.FIRST_NAME = contact?.firstName ?? "";
		vars.LAST_NAME = contact?.lastName ?? "";
	}

	const headers: Record<string, string> = {};
	if (!params.parts.some((part) => part && UNSUBSCRIBE_VAR_RE.test(part))) {
		return { vars, headers };
	}

	let unsubscribeUrl: string | null = null;
	let oneClickUrl: string | null = null;
	if (contact && canSignTokens()) {
		const token = await signPreferencesToken(
			{ contactId: contact.id, organizationId: params.organizationId },
			mailConfig.PREFERENCES_SECRET,
		);
		const base = await resolveUnsubscribeBase({
			organizationId: params.organizationId,
			from: params.from,
			fallbackBase: mailConfig.TRACKING_BASE_URL,
			protocol: mailConfig.BASE_URL.startsWith("https://")
				? "https://"
				: "http://",
		});
		unsubscribeUrl = unsubscribePageUrl(token, base);
		oneClickUrl = oneClickUnsubscribeUrl(token, base);
	} else if (contact) {
		log.warn({
			message:
				"PREFERENCES_SECRET is not set for the mail service; unsubscribe links fall back to mailto",
			organizationId: params.organizationId,
		});
	}

	unsubscribeUrl ??= mailtoUnsubscribeUrl({ from: params.from, replyTo });
	vars.UNSUBSCRIBE_URL = unsubscribeUrl ?? "";
	vars.unsubscribe_url = unsubscribeUrl ?? "";
	Object.assign(
		headers,
		listUnsubscribeHeaders({ oneClickUrl, from: params.from, replyTo }),
	);
	return { vars, headers };
}

/** Add `extra` headers the caller did not set themselves (case-insensitive). */
export function mergeMissingHeaders(
	headers: Record<string, string> | undefined,
	extra: Record<string, string>,
): Record<string, string> | undefined {
	const names = new Set(
		Object.keys(headers ?? {}).map((name) => name.toLowerCase()),
	);
	const missing = Object.entries(extra).filter(
		([name]) => !names.has(name.toLowerCase()),
	);
	// The caller's own List-Unsubscribe wins; never mix the pair.
	if (names.has("list-unsubscribe")) return headers;
	if (missing.length === 0) return headers;
	return { ...(headers ?? {}), ...Object.fromEntries(missing) };
}
