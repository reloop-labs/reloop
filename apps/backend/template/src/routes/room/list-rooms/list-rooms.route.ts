import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia } from "elysia";
import { listRoomsController } from "./list-rooms.controllers";

export const listRoomsRoute = new Elysia().use(authMiddleware).get(
	"/rooms",
	async ({ organizationId }) => {
		return await listRoomsController(organizationId);
	},
	{
		auth: true,
		detail: {
			tags: ["Rooms"],
			summary: "List active rooms",
			description: "Lists all active collaboration rooms",
		},
	},
);
