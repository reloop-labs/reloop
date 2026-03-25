import { contactRoutes } from "@be/contacts/routes/contact/contact.routes";
import { propertyRoutes } from "@be/contacts/routes/property/property.routes";
import { topicRoutes } from "@be/contacts/routes/topic/topic.routes";
import { Elysia } from "elysia";

export const allRoutes = new Elysia()
	.use(contactRoutes)
	.use(propertyRoutes)
	.use(topicRoutes);
