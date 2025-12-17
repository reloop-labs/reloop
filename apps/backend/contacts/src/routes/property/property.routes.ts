import { authMiddleware } from "@be/contacts/middleware/auth";
import { createPropertyRoute } from "@be/contacts/routes/property/routes/create-property.route";
import { listPropertiesRoute } from "@be/contacts/routes/property/routes/list-properties.route";
import { deletePropertyRoute } from "@be/contacts/routes/property/routes/delete-property.route";
import { Elysia } from "elysia";

export const propertyRoutes = new Elysia({
  prefix: "/v1/properties",
  name: "PropertyRoutes",
})
  .use(authMiddleware)
  .use(createPropertyRoute)
  .use(listPropertiesRoute)
  .use(deletePropertyRoute);
