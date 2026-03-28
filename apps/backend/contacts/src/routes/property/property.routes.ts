import { authMiddleware } from "@be/contacts/middleware/auth";
import { createPropertyRoute } from "@be/contacts/routes/property/create-property/create-property.route";
import { deletePropertyRoute } from "@be/contacts/routes/property/delete-property/delete-property.route";
import { listPropertiesRoute } from "@be/contacts/routes/property/list-properties/list-properties.route";
import { updatePropertyRoute } from "@be/contacts/routes/property/update-property/update-property.route";
import { Elysia } from "elysia";

export const propertyRoutes = new Elysia({
	prefix: "/v1/properties",
	name: "PropertyRoutes",
})
	.use(authMiddleware)
	.use(createPropertyRoute)
	.use(listPropertiesRoute)
	.use(updatePropertyRoute)
	.use(deletePropertyRoute);
