import { log } from "evlog";
import "dotenv/config";
import { cors } from "@elysiajs/cors";

import { openapi } from "@elysiajs/openapi";

import { Elysia } from "elysia";
import { kumomtaConfig } from "./kumomta.config";
import { kumomtaRoutes } from "./routes/kumomta.routes";
import { landing } from "./routes/landing/landing.index";
import { loader } from "./utils/loader";

const app = new Elysia({
	prefix: "/api/kumomta",
	name: "Server",
})
	.use(cors())
	.use(
		openapi({
			documentation: {
				info: {
					title: "KumoMTA Service",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						apiKey: {
							type: "apiKey",
							name: "x-kumomta-key",
							in: "header",
						},
					},
				},
			},
		}),
	)
	.use(landing)
	.use(kumomtaRoutes);

await loader();

app.listen(kumomtaConfig.port, (server) => {
	log.info(
		"server",
		`🦊 KumoMTA Server is running at http://${server?.hostname}:${server?.port}`,
	);
});

export type App = typeof app;
