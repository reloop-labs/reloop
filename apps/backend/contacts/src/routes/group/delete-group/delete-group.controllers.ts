import {
	ContactErrors,
	GroupErrors,
} from "@be/contacts/error/contacts.error-response";
import type { GroupModel } from "@be/contacts/model/group.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { GROUP_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const deleteGroupController = async ({
	organizationId,
	group_id,
}: {
	organizationId: string;
	group_id: string;
}): Promise<
	| {
			object: "contact_group";
			success: boolean;
			id: string;
			name: string;
			event: string;
	  }
	| GroupModel.GroupNotFound
	| GroupModel.Unauthorized
> => {
	const log = useLogger();
	log.info("Deleting group", { group_id });

	try {
		const group = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, group_id),
				eq(schema.group.organizationId, organizationId),
				isNull(schema.group.deletedAt),
			),
		});

		if (!group) {
			log.warn("Group not found for deletion", { group_id });
			throw GroupErrors.notFound(group_id);
		}

		await db
			.update(schema.group)
			.set({
				deletedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(schema.group.id, group_id),
					eq(schema.group.organizationId, organizationId),
				),
			);

		log.info("Group soft-deleted successfully", { group_id });

		const result = {
			object: "contact_group" as const,
			success: true,
			id: group.id,
			name: group.name,
			event: GROUP_DELETE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Debug deleting group", {
			group_id,
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
};
