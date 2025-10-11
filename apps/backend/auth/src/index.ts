import "dotenv/config";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { landing } from "./landing";
import { auth, OpenAPI } from "./lib/auth";
import { loader } from "./loader";
import { statsRoutes } from "./routes/stats";

const port = Number(process.env.PORT || 3000);

const app = new Elysia({ prefix: "/api/auth", name: "Auth Service" })
	.use(serverTiming())
	.use(
		swagger({
			path: "/docs",
			documentation: {
				components: await OpenAPI.components(),
				paths: await OpenAPI.getPaths(),
			},
		}),
	)
	.mount("/", auth.handler)
	.use(landing)
	.use(statsRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		console.log(`Auth Server is running on http://localhost:${port}/api/auth`);
	});

export type App = typeof app;
