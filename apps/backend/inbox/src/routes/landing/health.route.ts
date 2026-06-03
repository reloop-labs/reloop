import { Elysia } from "elysia";

export const healthRoute = new Elysia().get("/health", () => {
	return { status: "ok", service: "inbox" };
});
