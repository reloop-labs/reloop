import { Elysia } from "elysia";
import { addContactToChannelRoute } from "./add-contact-to-channel/add-contact-to-channel.route";
import { addContactToGroupRoute } from "./add-contact-to-group/add-contact-to-group.route";
import { createContactRoute } from "./create-contact/create-contact.route";
import { deleteContactRoute } from "./delete-contact/delete-contact.route";
import { getContactRoute } from "./get-contact/get-contact.route";
import { listContactsRoute } from "./list-contacts/list-contacts.route";
import { removeContactFromGroupRoute } from "./remove-contact-from-group/remove-contact-from-group.route";
import { updateContactRoute } from "./update-contact/update-contact.route";
import { updateContactChannelRoute } from "./update-contact-channel/update-contact-channel.route";

export const contactRoutes = new Elysia({ name: "ContactRoutes" })

	.use(createContactRoute)
	.use(getContactRoute)
	.use(listContactsRoute)
	.use(updateContactRoute)
	.use(deleteContactRoute)

	.use(addContactToChannelRoute)

	.use(addContactToGroupRoute)
	.use(removeContactFromGroupRoute)

	.use(updateContactChannelRoute);
