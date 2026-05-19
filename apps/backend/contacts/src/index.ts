import "dotenv/config";
import { contactsConfig } from "@be/contacts/contacts.config";
import { channelRoutes } from "@be/contacts/routes/channel/channel.routes";
import { contactRoutes } from "@be/contacts/routes/contact/contact.routes";
import { groupRoutes } from "@be/contacts/routes/group/group.routes";
import { agentCardRoute } from "@be/contacts/routes/landing/agent-card.route";
import { healthRoute } from "@be/contacts/routes/landing/health.route";
import { landingRoute } from "@be/contacts/routes/landing/landing.route";
import { preferencesRoutes } from "@be/contacts/routes/preferences/preferences.route";
import { propertyRoutes } from "@be/contacts/routes/property/property.routes";
import { loader } from "@be/contacts/utils/loader";
import { opentelemetry } from "@elysia/opentelemetry";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";

initLogger({ env: { service: "contacts" } });

const port = contactsConfig.port;
const contactsService = new Elysia({
	prefix: "/api/contacts",
	name: "Contacts Service",
})
	.use(opentelemetry())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Contacts Service",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						apiKey: {
							type: "apiKey",
							name: "x-api-key",
							in: "header",
						},
					},
				},
			},
		}),
	)
	.use(evlog())
	.use(serverTiming())
	.use(landingRoute)
	.use(healthRoute)
	.use(agentCardRoute)
	.use(contactRoutes)
	.use(propertyRoutes)
	.use(channelRoutes)
	.use(groupRoutes)
	.use(preferencesRoutes)
	.onError(({ error, set }) => {
		const parsed = parseError(error);
		set.status = parsed.status;
		return {
			message: parsed.message,
			why: parsed.why,
			fix: parsed.fix,
			link: parsed.link,
		};
	})
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Contacts Service",
			`Running on:\n  - Local: http://localhost:${port}/api/contacts\n  - Base:  ${contactsConfig.BASE_URL}/api/contacts`,
		);
	});

export type ContactsService = typeof contactsService;
