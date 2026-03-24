import "dotenv/config";
import { contactsConfig } from "@be/contacts/contacts.config";
import { topicRoutes } from "@be/contacts/routes/topic/topic.routes";
import { topicSubscriptionRoutes } from "@be/contacts/routes/audience-topic-mapper/audience-topic-mapper.routes";
import { contactRoutes } from "@be/contacts/routes/contact/contact.routes";
import { landing } from "@be/contacts/routes/landing/landing.index";
import { propertyRoutes } from "@be/contacts/routes/property/property.routes";
import { loader } from "@be/contacts/utils/loader";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

const port = contactsConfig.port;
const contactsService = new Elysia({
	prefix: "/api/contacts",
	name: "Contacts Service",
})
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
			references: fromTypes(
				contactsConfig.NODE_ENV === "production"
					? "dist/index.d.ts"
					: "src/index.ts",
			),
		}),
	)
	.use(serverTiming())
	.use(landing)
	.use(contactRoutes)
	.use(propertyRoutes)
	.use(topicRoutes)
	.use(topicSubscriptionRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Contacts Server is running on http://localhost:${port}/api/contacts`,
		);
	});

export type ContactsService = typeof contactsService;
