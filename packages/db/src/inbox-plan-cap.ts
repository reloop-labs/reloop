import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { type DatabaseInstance, db } from "./client";
import { mailbox } from "./schema/inbox";
import { isSelfHosted } from "./self-hosted";

/**
 * Bring an org's agent inboxes in line with its plan cap after a plan change.
 * Among non-disabled mailboxes, the oldest `maxAgentInboxes` keep working;
 * active ones beyond the cap become `suspended`, and suspended ones back
 * within the cap are re-activated. Mailboxes the user disabled are untouched.
 * Returns the number of mailboxes suspended and re-activated.
 */
export async function syncInboxesToPlanCap(args: {
	organizationId: string;
	maxAgentInboxes: number;
	tx?: DatabaseInstance;
}): Promise<{ suspended: number; reactivated: number }> {
	const client = args.tx ?? db;
	if (isSelfHosted()) {
		const reactivated = await client
			.update(mailbox)
			.set({ status: "active" })
			.where(
				and(
					eq(mailbox.organizationId, args.organizationId),
					eq(mailbox.status, "suspended"),
				),
			)
			.returning({ id: mailbox.id });
		return { suspended: 0, reactivated: reactivated.length };
	}

	// Same lock as inbox creation, so a concurrent create can't slip past.
	await client.execute(
		sql`select pg_advisory_xact_lock(hashtext(${`${args.organizationId}:inbox`}))`,
	);

	const rows = await client
		.select({ id: mailbox.id, status: mailbox.status })
		.from(mailbox)
		.where(eq(mailbox.organizationId, args.organizationId))
		.orderBy(asc(mailbox.createdAt), asc(mailbox.id));

	// User-disabled inboxes don't occupy a slot; active + suspended compete, oldest first.
	const cap = Math.max(0, args.maxAgentInboxes);
	const eligible = rows.filter((m) => m.status !== "disabled");
	const withinCap = eligible.slice(0, cap);
	const overCap = eligible.slice(cap);

	const toReactivate = withinCap
		.filter((m) => m.status === "suspended")
		.map((m) => m.id);
	const toSuspend = overCap
		.filter((m) => m.status === "active")
		.map((m) => m.id);

	if (toReactivate.length > 0) {
		await client
			.update(mailbox)
			.set({ status: "active" })
			.where(inArray(mailbox.id, toReactivate));
	}
	if (toSuspend.length > 0) {
		await client
			.update(mailbox)
			.set({ status: "suspended" })
			.where(inArray(mailbox.id, toSuspend));
	}

	return { suspended: toSuspend.length, reactivated: toReactivate.length };
}
