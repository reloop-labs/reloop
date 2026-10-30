/**
 * api-key-mailbox-scope.ts — which mailboxes may the calling API key touch?
 *
 * API keys can be restricted to domains or exact addresses (api_key_scope).
 * The mail service, SMTP AUTH and IMAP login enforce that; the inbox API has
 * to as well, or a restricted key could read and send from every mailbox in
 * the organization. Session (dashboard) requests and unrestricted keys get
 * full access, so every helper here is a no-op for them.
 */

import {
	type ApiKeyScope,
	loadApiKeyScope,
	scopeAllowsAddress,
} from "@reloop/db/api-key-scope";
import { db } from "@reloop/db/client";
import {
	composeDraft,
	emailLabel,
	emailLog,
	emailThread,
	inboundEmail,
	mailbox,
	pendingOutboundEmail,
	threadNote,
} from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { InboxErrors } from "./errors";
import { resolveThreadIdForMessage } from "./thread-correlation";

export type MailboxScope =
	| { restricted: false }
	| {
			restricted: true;
			/** Mailboxes in the organization whose address the key allows. */
			mailboxIds: string[];
			/** The key's raw scope, for checking addresses that have no mailbox row. */
			keyScope: ApiKeyScope;
	  };

export const UNRESTRICTED_MAILBOX_SCOPE: MailboxScope = { restricted: false };

type MailboxRow = { id: string; email: string };

/** Pure: narrow the organization's mailboxes to the ones the key allows. */
export function buildMailboxScope(
	keyScope: ApiKeyScope,
	mailboxes: MailboxRow[],
): MailboxScope {
	if (!keyScope.restricted) return UNRESTRICTED_MAILBOX_SCOPE;
	return {
		restricted: true,
		mailboxIds: mailboxes
			.filter((m) => scopeAllowsAddress(keyScope, m.email))
			.map((m) => m.id),
		keyScope,
	};
}

/** Load the scope for this request. No API key means a session: full access. */
export async function resolveMailboxScope(
	organizationId: string,
	apiKeyId: string | undefined,
): Promise<MailboxScope> {
	if (!apiKeyId) return UNRESTRICTED_MAILBOX_SCOPE;

	const keyScope = await loadApiKeyScope(apiKeyId);
	if (!keyScope.restricted) return UNRESTRICTED_MAILBOX_SCOPE;

	const mailboxes = await db
		.select({ id: mailbox.id, email: mailbox.email })
		.from(mailbox)
		.where(eq(mailbox.organizationId, organizationId));

	return buildMailboxScope(keyScope, mailboxes);
}

/** Pure. A null mailbox (thread not tied to one) is only visible without restrictions. */
export function scopeAllowsMailbox(
	scope: MailboxScope,
	mailboxId: string | null | undefined,
): boolean {
	if (!scope.restricted) return true;
	return !!mailboxId && scope.mailboxIds.includes(mailboxId);
}

export function assertMailboxAllowed(
	scope: MailboxScope,
	mailboxId: string | null | undefined,
): void {
	if (!scopeAllowsMailbox(scope, mailboxId)) {
		throw InboxErrors.apiKeyMailboxNotAllowed(
			mailboxId ? `mailbox ${mailboxId}` : "this conversation",
		);
	}
}

/** Pure: for addresses that are not mailboxes, such as a new mailbox or an outbound sender. */
export function assertAddressAllowed(
	scope: MailboxScope,
	address: string,
): void {
	if (scope.restricted && !scopeAllowsAddress(scope.keyScope, address)) {
		throw InboxErrors.apiKeyMailboxNotAllowed(address.trim().toLowerCase());
	}
}

/**
 * Pure: which mailbox IDs a list endpoint may return.
 * undefined = no restriction; otherwise only these IDs (possibly empty).
 * An explicitly requested mailbox outside the scope is a 403, not an empty list.
 */
export function listMailboxFilter(
	scope: MailboxScope,
	requestedMailboxId?: string,
): string[] | undefined {
	if (requestedMailboxId) {
		assertMailboxAllowed(scope, requestedMailboxId);
		return [requestedMailboxId];
	}
	return scope.restricted ? scope.mailboxIds : undefined;
}

/**
 * Throws 403 when the thread belongs to a mailbox outside the scope.
 * Thread routes also accept message IDs (inbound, email log, thread message)
 * and resolve them to a thread, so those are resolved and checked too.
 * Unknown IDs pass so the controller can return its usual 404.
 */
export async function assertThreadAllowed(
	scope: MailboxScope,
	organizationId: string,
	threadId: string,
): Promise<void> {
	if (!scope.restricted) return;
	const resolvedId =
		(await resolveThreadIdForMessage(threadId, organizationId)) ?? threadId;
	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, resolvedId),
			eq(emailThread.organizationId, organizationId),
		),
		columns: { mailboxId: true },
	});
	if (thread) {
		assertMailboxAllowed(scope, thread.mailboxId);
		return;
	}
	// Standalone messages with no thread row are served by thread routes too.
	await assertMessageAllowed(scope, organizationId, threadId);
}

export async function assertThreadsAllowed(
	scope: MailboxScope,
	organizationId: string,
	threadIds: string[],
): Promise<void> {
	for (const id of threadIds) {
		await assertThreadAllowed(scope, organizationId, id);
	}
}

/**
 * Message IDs are an inbound email or an outbound email log. Inbound messages
 * are checked by mailbox, outbound ones by sender address. Unknown IDs pass so
 * the controller can return its usual 404.
 */
export async function assertMessageAllowed(
	scope: MailboxScope,
	organizationId: string,
	messageId: string,
): Promise<void> {
	if (!scope.restricted) return;

	const inbound = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, messageId),
			eq(inboundEmail.organizationId, organizationId),
		),
		columns: { mailboxId: true },
	});
	if (inbound) {
		assertMailboxAllowed(scope, inbound.mailboxId);
		return;
	}

	const outbound = await db.query.emailLog.findFirst({
		where: and(
			eq(emailLog.id, messageId),
			eq(emailLog.organizationId, organizationId),
		),
		columns: { fromEmail: true },
	});
	if (outbound) assertAddressAllowed(scope, bareAddress(outbound.fromEmail));
}

export async function assertMessagesAllowed(
	scope: MailboxScope,
	organizationId: string,
	messageIds: string[],
): Promise<void> {
	for (const id of messageIds) {
		await assertMessageAllowed(scope, organizationId, id);
	}
}

/** Throws 403 when a queued send belongs to a mailbox outside the scope. */
export async function assertPendingSendAllowed(
	scope: MailboxScope,
	organizationId: string,
	pendingId: string,
): Promise<void> {
	if (!scope.restricted) return;
	const pending = await db.query.pendingOutboundEmail.findFirst({
		where: and(
			eq(pendingOutboundEmail.id, pendingId),
			eq(pendingOutboundEmail.organizationId, organizationId),
		),
		columns: { mailboxId: true },
	});
	if (pending) assertMailboxAllowed(scope, pending.mailboxId);
}

/** Throws 403 when the draft belongs to a mailbox outside the scope. */
export async function assertDraftAllowed(
	scope: MailboxScope,
	organizationId: string,
	draftId: string,
): Promise<void> {
	if (!scope.restricted) return;
	const draft = await db.query.composeDraft.findFirst({
		where: and(
			eq(composeDraft.id, draftId),
			eq(composeDraft.organizationId, organizationId),
		),
		columns: { mailboxId: true },
	});
	if (draft) assertMailboxAllowed(scope, draft.mailboxId);
}

/** Throws 403 when the note sits on a thread outside the scope. */
export async function assertNoteAllowed(
	scope: MailboxScope,
	organizationId: string,
	noteId: string,
): Promise<void> {
	if (!scope.restricted) return;
	const note = await db.query.threadNote.findFirst({
		where: and(
			eq(threadNote.id, noteId),
			eq(threadNote.organizationId, organizationId),
		),
		columns: { threadId: true },
	});
	if (note) await assertThreadAllowed(scope, organizationId, note.threadId);
}

/** Throws 403 when the label belongs to a mailbox outside the scope. */
export async function assertLabelAllowed(
	scope: MailboxScope,
	organizationId: string,
	labelId: string,
): Promise<void> {
	if (!scope.restricted) return;
	const label = await db.query.emailLabel.findFirst({
		where: and(
			eq(emailLabel.id, labelId),
			eq(emailLabel.organizationId, organizationId),
		),
		columns: { mailboxId: true },
	});
	if (label) assertMailboxAllowed(scope, label.mailboxId);
}

/** Bare address from `"Name <a@b.com>"` or `a@b.com`. */
export function bareAddress(value: string): string {
	const angle = value.match(/<([^>]+)>/);
	return (angle?.[1] ?? value).trim().toLowerCase();
}
