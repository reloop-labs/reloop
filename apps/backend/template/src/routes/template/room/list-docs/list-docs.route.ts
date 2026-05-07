import type { YjsPersistence } from "@be/template/utils/persistence";
import { Elysia } from "elysia";
import { listDocsController } from "./list-docs.controllers";

export const listDocsRoute = new Elysia().get("/docs", async (ctx) => {
	const persistence =
		(ctx as unknown as { persistence?: YjsPersistence | null }).persistence ??
		null;

	return await listDocsController(persistence);
});
