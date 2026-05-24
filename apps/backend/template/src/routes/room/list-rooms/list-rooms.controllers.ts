import { getAllRooms } from "@be/template/plugins/room";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

export async function listRoomsController(organizationId: string) {
	log.info({
		organizationId,
		message: "Listing active collaboration rooms",
	});

	try {
		const rooms = getAllRooms();

		const templates = await db
			.select({ id: schema.template.id })
			.from(schema.template)
			.where(
				and(
					eq(schema.template.organizationId, organizationId),
					isNull(schema.template.deletedAt),
				),
			);
		const allowedIds = new Set(templates.map((t) => t.id));

		const activeRooms = Array.from(rooms.entries())
			.filter(([name]) => allowedIds.has(name))
			.map(([name, room]) => ({
				name,
				clients: room.clients.size,
				lastActivity: new Date(room.lastActivity).toISOString(),
			}));

		log.info({
			organizationId,
			totalActiveRooms: activeRooms.length,
			message: "Successfully listed active collaboration rooms",
		});

		return { rooms: activeRooms };
	} catch (error) {
		log.error({
			organizationId,
			message: "Error listing active collaboration rooms",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
