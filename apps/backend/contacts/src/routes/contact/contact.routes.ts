import { authMiddleware } from "@be/contacts/middleware/auth";
import { addContactToGroupRoute } from "@be/contacts/routes/contact/routes/add-contact-to-group.route";
import { addContactToTopicRoute } from "@be/contacts/routes/contact/routes/add-contact-to-topic.route";
import { createContactRoute } from "@be/contacts/routes/contact/routes/create-contact.route";
import { deleteContactRoute } from "@be/contacts/routes/contact/routes/delete-contact.route";
import { getContactRoute } from "@be/contacts/routes/contact/routes/get-contact.route";
import { listContactsRoute } from "@be/contacts/routes/contact/routes/list-contacts.route";
import { removeContactFromGroupRoute } from "@be/contacts/routes/contact/routes/remove-contact-from-group.route";
import { updateContactRoute } from "@be/contacts/routes/contact/routes/update-contact.route";
import { updateContactTopicRoute } from "@be/contacts/routes/contact/routes/update-contact-topic.route";
import { Elysia } from "elysia";

export const contactRoutes = new Elysia({ name: "ContactRoutes" })
	.use(authMiddleware)
	// Contact Routes
	.use(createContactRoute)
	.use(getContactRoute)
	.use(listContactsRoute)
	.use(updateContactRoute)
	.use(deleteContactRoute)
	// Add to Topic
	.use(addContactToTopicRoute)
	// Group Management
	.use(addContactToGroupRoute)
	.use(removeContactFromGroupRoute)
	// Topic Management
	.use(updateContactTopicRoute);
