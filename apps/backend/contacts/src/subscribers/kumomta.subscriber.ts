/**
 * kumomta.subscriber.ts
 *
 * Listens to kumomta.event on NATS and automatically creates/updates contacts
 * based on email deliverability outcomes.
 *
 * Lifecycle:
 *  • Delivery      → upsert contact (create if not exists), set email_deliverability=delivered
 *  • Bounce        → upsert contact, suppress with hard_bounce, set email_deliverability=bounced
 *  • AdminBounce   → same as Bounce
 *  • Feedback      → upsert contact, suppress with spam_complaint, set email_deliverability=spam
 *  • Reception / TransientFailure / Expiration / OOB → no-op (skip)
 *
 * Safety guarantees:
 *  • Never overwrites a contact that is already manually unsubscribed or blocked
 *  • Idempotent: running the same event twice produces the same result
 *  • Runs in a separate NATS queue group from the logs service so both receive every event
 */

import {
	BusEvent,
	bus,
	type KumomtaLogRecordPayload,
} from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { log } from "evlog";

// ─── Types ───────────────────────────────────────────────────────────────────

type KumomtaEventType =
	| "Reception"
	| "Delivery"
	| "Bounce"
	| "TransientFailure"
	| "Expiration"
	| "OOB"
	| "Feedback"
	| "AdminBounce";

type Deliverability = "delivered" | "bounced" | "spam";
type SuppressionReason = "hard_bounce" | "spam_complaint";

interface EventAction {
	deliverability: Deliverability;
	suppressionReason?: SuppressionReason;
}

/** Maps actionable KumoMTA event types to their contact-level outcomes */
const EVENT_ACTION_MAP: Partial<Record<KumomtaEventType, EventAction>> = {
	Delivery: { deliverability: "delivered" },
	Bounce: {
		deliverability: "bounced",
		suppressionReason: "hard_bounce",
	},
	AdminBounce: {
		deliverability: "bounced",
		suppressionReason: "hard_bounce",
	},
	Feedback: {
		deliverability: "spam",
		suppressionReason: "spam_complaint",
	},
};

// ─── userId Resolution ────────────────────────────────────────────────────────

/**
 * Resolves the userId that should own the auto-created contact.
 *
 * Resolution order (strict — no random fallback):
 *  1. emailLog.userId         — the logged-in user who triggered the send
 *  2. apikey.userId           — the user who owns the API key used for the send
 *
 * After resolution we validate that the userId is an active member of the
 * given organizationId. This prevents cross-org contamination in edge cases.
 *
 * Returns null if the userId cannot be traced to the sending organization.
 */
async function resolveAndValidateUserId(
	emailLog: { userId: string | null; apikeyId: string | null },
	organizationId: string,
): Promise<string | null> {
	let candidateUserId: string | null = null;

	// 1. Direct user attribution from the email log
	if (emailLog.userId) {
		candidateUserId = emailLog.userId;
	}
	// 2. API-key sends: trace the key back to its owner within this exact org
	else if (emailLog.apikeyId) {
		const key = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, emailLog.apikeyId),
				eq(schema.apikey.organizationId, organizationId),
			),
			columns: { userId: true },
		});
		candidateUserId = key?.userId ?? null;
	}

	if (!candidateUserId) return null;

	// ── Org-membership gate ────────────────────────────────────────────────────
	// Confirm the resolved user actually belongs to this organization.
	// Guards against stale emailLog data or cross-org API key misuse.
	const membership = await db.query.member.findFirst({
		where: and(
			eq(schema.member.userId, candidateUserId),
			eq(schema.member.organizationId, organizationId),
		),
		columns: { userId: true },
	});

	if (!membership) {
		log.warn({
			candidateUserId,
			organizationId,
			message:
				"[auto-contact] Resolved userId is not a member of this organization — skipping contact upsert",
		});
		return null;
	}

	return candidateUserId;
}

// ─── Contact Upsert ───────────────────────────────────────────────────────────

/**
 * Upserts a contact for the given email + org combination.
 * - If an active contact already exists → returns it untouched (no override)
 * - If a soft-deleted contact exists → restores it
 * - Otherwise → inserts a new contact with status=subscribed
 */
async function upsertContact(
	email: string,
	organizationId: string,
	userId: string,
): Promise<{ contact: typeof schema.contact.$inferSelect; created: boolean }> {
	const rows = await db
		.select()
		.from(schema.contact)
		.where(
			and(
				eq(schema.contact.email, email),
				eq(schema.contact.organizationId, organizationId),
			),
		)
		.limit(2);

	const activeContact = rows.find((r) => r.deletedAt === null) ?? null;
	const softDeletedContact = rows.find((r) => r.deletedAt !== null) ?? null;

	// Active contact exists — never touch it (honour manual management)
	if (activeContact) {
		return { contact: activeContact, created: false };
	}

	// Restore a previously soft-deleted contact
	if (softDeletedContact) {
		const [restored] = await db
			.update(schema.contact)
			.set({
				deletedAt: null,
				updatedAt: new Date(),
			})
			.where(eq(schema.contact.id, softDeletedContact.id))
			.returning();

		if (!restored) throw new Error("Failed to restore soft-deleted contact");

		log.info({
			contactId: restored.id,
			email,
			message: "[auto-contact] Restored soft-deleted contact",
		});

		return { contact: restored, created: true };
	}

	// Brand-new contact
	const [newContact] = await db
		.insert(schema.contact)
		.values({
			email,
			organizationId,
			userId,
			status: "subscribed",
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	if (!newContact) throw new Error("Failed to insert new contact");

	log.info({
		contactId: newContact.id,
		email,
		organizationId,
		message: "[auto-contact] Created new contact from email send",
	});

	return { contact: newContact, created: true };
}

// ─── Deliverability Property ──────────────────────────────────────────────────

const DELIVERABILITY_PROPERTY_NAME = "email_deliverability";

/**
 * Upserts the org-level property definition for `email_deliverability`
 * then writes/updates the value for the given contact.
 *
 * The property definition is created once per org and reused on subsequent calls.
 */
async function setDeliverabilityProperty(
	contactId: string,
	organizationId: string,
	userId: string,
	value: Deliverability,
): Promise<void> {
	// ── 1. Ensure property definition exists for this org ──────────────────────
	let property = await db.query.contactProperty.findFirst({
		where: and(
			eq(schema.contactProperty.propertyName, DELIVERABILITY_PROPERTY_NAME),
			eq(schema.contactProperty.organizationId, organizationId),
		),
	});

	if (!property) {
		// Use onConflictDoNothing to handle race conditions gracefully
		const inserted = await db
			.insert(schema.contactProperty)
			.values({
				propertyName: DELIVERABILITY_PROPERTY_NAME,
				propertyType: "string",
				defaultValue: null,
				organizationId,
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.onConflictDoNothing()
			.returning();

		property = inserted[0];

		// Another worker may have inserted first — re-fetch
		if (!property) {
			property = await db.query.contactProperty.findFirst({
				where: and(
					eq(
						schema.contactProperty.propertyName,
						DELIVERABILITY_PROPERTY_NAME,
					),
					eq(schema.contactProperty.organizationId, organizationId),
				),
			});
		}
	}

	if (!property) {
		log.warn({
			organizationId,
			message:
				"[auto-contact] Could not resolve email_deliverability property definition — skipping property write",
		});
		return;
	}

	// ── 2. Upsert the value for this specific contact ─────────────────────────
	await db
		.insert(schema.contactPropertyValue)
		.values({
			contactId,
			propertyId: property.id,
			value,
			organizationId,
			userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			// unique constraint: cpv_unique_contact_property_value (contactId, propertyId)
			target: [
				schema.contactPropertyValue.contactId,
				schema.contactPropertyValue.propertyId,
			],
			set: {
				value,
				updatedAt: new Date(),
			},
		});

	log.info({
		contactId,
		property: DELIVERABILITY_PROPERTY_NAME,
		value,
		message: "[auto-contact] email_deliverability property updated",
	});
}

// ─── Contact Suppression ──────────────────────────────────────────────────────

/**
 * Suppresses a contact (status=blocked) only if it is currently subscribed.
 * Contacts already manually set to unsubscribed/blocked are left as-is.
 */
async function suppressContact(
	contactId: string,
	suppressionReason: SuppressionReason,
): Promise<boolean> {
	const result = await db
		.update(schema.contact)
		.set({
			status: "blocked",
			suppressionReason,
			suppressedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(schema.contact.id, contactId),
				eq(schema.contact.status, "subscribed"), // only suppress if still subscribed
			),
		)
		.returning({ id: schema.contact.id });

	const suppressed = result.length > 0;

	if (suppressed) {
		log.info({
			contactId,
			suppressionReason,
			message: "[auto-contact] Contact suppressed",
		});
	}

	return suppressed;
}

// ─── Main Subscriber ──────────────────────────────────────────────────────────

export async function initKumomtaContactSubscriber() {
	await bus.subscribe(
		BusEvent.KUMOMTA_EVENT,
		async (event: KumomtaLogRecordPayload) => {
			try {
				const eventType = event.type as KumomtaEventType;
				const action = EVENT_ACTION_MAP[eventType];

				// Skip non-actionable event types (Reception, TransientFailure, etc.)
				if (!action) {
					log.debug({
						type: eventType,
						message: "[auto-contact] Skipping non-actionable KumoMTA event",
					});
					return;
				}

				// ── Resolve emailLogId ─────────────────────────────────────────────
				const emailLogId =
					event.headers?.["X-Email-Log-ID"] ?? event.meta?.["X-Email-Log-ID"];

				if (!emailLogId) {
					log.warn({
						kumomtaId: event.id,
						type: eventType,
						message:
							"[auto-contact] Missing X-Email-Log-ID — cannot resolve org context, skipping",
					});
					return;
				}

				// ── Resolve organizationId ────────────────────────────────────────
				// Primary source: X-Org-ID stamped directly on the message by KumoMTA.
				// This is available without any DB lookup and is org-authoritative.
				const headerOrgId = event.headers?.["X-Org-ID"];

				// ── Fetch emailLog for userId + recipient context ──────────────────
				const emailLog = await db.query.emailLog.findFirst({
					where: eq(schema.emailLog.id, emailLogId),
					columns: {
						organizationId: true,
						userId: true,
						apikeyId: true,
						toEmails: true,
					},
				});

				if (!emailLog) {
					log.warn({
						emailLogId,
						kumomtaId: event.id,
						message:
							"[auto-contact] emailLog not found for ID — skipping contact upsert",
					});
					return;
				}

				// ── Cross-validate org ────────────────────────────────────────────
				// Use X-Org-ID header when present; fall back to emailLog.organizationId.
				// If both exist they MUST agree — a mismatch indicates message tampering.
				const organizationId = headerOrgId ?? emailLog.organizationId;

				if (headerOrgId && headerOrgId !== emailLog.organizationId) {
					log.warn({
						emailLogId,
						headerOrgId,
						logOrgId: emailLog.organizationId,
						kumomtaId: event.id,
						message:
							"[auto-contact] X-Org-ID header does not match emailLog.organizationId — skipping contact upsert",
					});
					return;
				}

				// ── Resolve userId (org-scoped, membership-validated) ──────────────
				const userId = await resolveAndValidateUserId(emailLog, organizationId);

				if (!userId) {
					log.warn({
						emailLogId,
						organizationId,
						message:
							"[auto-contact] Could not resolve a userId for org — skipping contact upsert",
					});
					return;
				}

				// ── Use recipient from KumoMTA event (per-delivery precision) ──────
				// KumoMTA fires one event per recipient, so event.recipient is the
				// exact address for this delivery attempt. Fall back to toEmails from
				// the log if the recipient field is unexpectedly empty.
				const { toEmails } = emailLog;
				const recipientEmails: string[] =
					event.recipient
						? [event.recipient]
						: Array.isArray(toEmails)
							? (toEmails as string[])
							: [];

				if (recipientEmails.length === 0) {
					log.warn({
						emailLogId,
						message: "[auto-contact] No recipient emails found — skipping",
					});
					return;
				}

				// ── Process each recipient ─────────────────────────────────────────
				for (const email of recipientEmails) {
					try {
						// 1. Upsert the contact (idempotent)
						const { contact, created } = await upsertContact(
							email,
							organizationId,
							userId,
						);

						// 2. Write deliverability property
						await setDeliverabilityProperty(
							contact.id,
							organizationId,
							userId,
							action.deliverability,
						);

						// 3. Suppress if this was a hard bounce or spam complaint
						let suppressed = false;
						if (action.suppressionReason) {
							suppressed = await suppressContact(
								contact.id,
								action.suppressionReason,
							);
						}

						// 4. Publish outcome events for audit / webhooks
						await bus.publish(BusEvent.CONTACT_AUTO_CREATED, {
							contactId: contact.id,
							email,
							organizationId,
							emailLogId,
							created,
						});

						if (action.deliverability !== "delivered" || suppressed) {
							await bus.publish(BusEvent.CONTACT_DELIVERABILITY_UPDATED, {
								contactId: contact.id,
								email,
								organizationId,
								emailLogId,
								deliverability: action.deliverability,
								suppressed,
							});
						}

						log.info({
							contactId: contact.id,
							email,
							organizationId,
							emailLogId,
							eventType,
							deliverability: action.deliverability,
							suppressed,
							created,
							message: `[auto-contact] Processed ${eventType} event`,
						});
					} catch (recipientError) {
						log.error({
							email,
							emailLogId,
							eventType,
							error:
								recipientError instanceof Error
									? recipientError.message
									: String(recipientError),
							message:
								"[auto-contact] Failed to process recipient — continuing with others",
						});
					}
				}
			} catch (error) {
				log.error({
					kumomtaId: event.id,
					type: event.type,
					error:
						error instanceof Error ? error.message : String(error),
					message:
						"[auto-contact] Unhandled error in KumoMTA contact subscriber",
				});
			}
		},
		// Separate queue group from logs service — both receive every event independently
		{ queue: "contacts-kumomta-worker" },
	);

	log.info("server", "[auto-contact] KumoMTA contact subscriber registered");
}
