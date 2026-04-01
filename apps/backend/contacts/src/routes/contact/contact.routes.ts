import { Elysia } from "elysia";
import { addContactToGroupRoute } from "./add-contact-to-group/add-contact-to-group.route";
import { addContactToTopicRoute } from "./add-contact-to-topic/add-contact-to-topic.route";
import { createContactRoute } from "./create-contact/create-contact.route";
import { deleteContactRoute } from "./delete-contact/delete-contact.route";
import { getContactRoute } from "./get-contact/get-contact.route";
import { listContactsRoute } from "./list-contacts/list-contacts.route";
import { removeContactFromGroupRoute } from "./remove-contact-from-group/remove-contact-from-group.route";
import { updateContactRoute } from "./update-contact/update-contact.route";
import { updateContactTopicRoute } from "./update-contact-topic/update-contact-topic.route";

export const contactRoutes = new Elysia({ name: "ContactRoutes" })
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
