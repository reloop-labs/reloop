import { db } from "@reloop/db/client";
import { adminAuditLog } from "@reloop/db/schema";

export async function writeAdminAudit({
	actorUserId,
	action,
	resourceType,
	resourceId,
	organizationId,
	metadata,
}: {
	actorUserId: string;
	action: string;
	resourceType: string;
	resourceId?: string | null;
	organizationId?: string | null;
	metadata?: Record<string, unknown>;
}) {
	await db.insert(adminAuditLog).values({
		actorUserId,
		action,
		resourceType,
		resourceId: resourceId ?? null,
		organizationId: organizationId ?? null,
		metadata: metadata ?? null,
	});
}
