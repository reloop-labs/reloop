import "dotenv/config";
import { logger } from "@bogeychan/elysia-logger";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { auth, OpenAPI } from "./lib/auth";

new Elysia()
	.use(serverTiming())
	.use(logger({ level: "error" }))
	.use(
		swagger({
			documentation: {
				components: await OpenAPI.components(),
				paths: await OpenAPI.getPaths("/api/auth"),
			},
		}),
	)
	.mount("/", auth.handler)
	.get("/api/status", () => "OK")
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
