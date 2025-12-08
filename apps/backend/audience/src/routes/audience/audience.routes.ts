import { authMiddleware } from "@be/audience/middleware/auth";
import { bulkImportContactsRoute } from "@be/audience/routes/audience/routes/bulk-import-contacts.route";
import { createContactRoute } from "@be/audience/routes/audience/routes/create-audience.route";
import { deleteContactRoute } from "@be/audience/routes/audience/routes/delete-audience.route";
import { getContactRoute } from "@be/audience/routes/audience/routes/get-audience.route";
import { listContactsRoute } from "@be/audience/routes/audience/routes/list-audiences.route";
import { searchContactsRoute } from "@be/audience/routes/audience/routes/search-audiences.route";
import { updateContactRoute } from "@be/audience/routes/audience/routes/update-audience.route";
import { Elysia } from "elysia";

export const contactRoutes = new Elysia({
	prefix: "/v1/contacts",
	name: "ContactRoutes",
})
	.use(authMiddleware)
	// Contact Routes
	.use(createContactRoute)
	.use(getContactRoute)
	.use(listContactsRoute)
	.use(updateContactRoute)
	.use(deleteContactRoute)
	// Search
	.use(searchContactsRoute)
	// Bulk Import
	.use(bulkImportContactsRoute);
