import { authMiddleware } from "@be/contacts/middleware/auth";
import { addContactToTopicRoute } from "@be/contacts/routes/contact/routes/add-contact-to-topic.route";
import { bulkImportContactsRoute } from "@be/contacts/routes/contact/routes/bulk-import-contacts.route";
import { createContactRoute } from "@be/contacts/routes/contact/routes/create-contact.route";
import { deleteContactRoute } from "@be/contacts/routes/contact/routes/delete-contact.route";
import { getContactRoute } from "@be/contacts/routes/contact/routes/get-contact.route";
import { getContactPropertiesRoute } from "@be/contacts/routes/contact/routes/get-contact-properties.route";
import { listContactsRoute } from "@be/contacts/routes/contact/routes/list-contacts.route";
import { searchContactsRoute } from "@be/contacts/routes/contact/routes/search-contacts.route";
import { updateContactRoute } from "@be/contacts/routes/contact/routes/update-contact.route";
import { Elysia } from "elysia";

export const contactRoutes = new Elysia({
	prefix: "/v1/contacts",
	name: "ContactRoutes",
})
	.use(authMiddleware)
	// Contact Routes
	.use(createContactRoute)
	.use(getContactRoute)
	.use(getContactPropertiesRoute)
	.use(listContactsRoute)
	.use(updateContactRoute)
	.use(deleteContactRoute)
	// Search
	.use(searchContactsRoute)
	// Bulk Import
	.use(bulkImportContactsRoute)
	// Add to Topic
	.use(addContactToTopicRoute);

