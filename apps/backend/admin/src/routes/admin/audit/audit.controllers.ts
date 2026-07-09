import { db } from "@reloop/db/client";
import { adminAuditLog, user } from "@reloop/db/schema";
import { count, desc, eq } from "drizzle-orm";

export async function listAuditController({
	limit = 50,
	offset = 0,
}: {
	limit?: number;
	offset?: number;
}) {
	const [totalRow] = await db.select({ value: count() }).from(adminAuditLog);

	const items = await db
		.select({
			id: adminAuditLog.id,
			actorUserId: adminAuditLog.actorUserId,
			actorEmail: user.email,
			actorName: user.name,
			action: adminAuditLog.action,
			resourceType: adminAuditLog.resourceType,
			resourceId: adminAuditLog.resourceId,
			organizationId: adminAuditLog.organizationId,
			metadata: adminAuditLog.metadata,
			createdAt: adminAuditLog.createdAt,
		})
		.from(adminAuditLog)
		.leftJoin(user, eq(adminAuditLog.actorUserId, user.id))
		.orderBy(desc(adminAuditLog.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		items,
		total: totalRow?.value ?? 0,
	};
}
