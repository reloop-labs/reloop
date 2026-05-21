import { getAllRooms } from "@be/template/plugins/room";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function listRoomsController(organizationId: string) {
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

	return {
		rooms: Array.from(rooms.entries())
			.filter(([name]) => allowedIds.has(name))
			.map(([name, room]) => ({
				name,
				clients: room.clients.size,
				lastActivity: new Date(room.lastActivity).toISOString(),
			})),
	};
}
