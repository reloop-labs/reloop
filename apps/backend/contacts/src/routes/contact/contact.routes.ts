import { Elysia } from "elysia";
import { addContactToChannelRoute } from "./add-contact-to-channel/add-contact-to-channel.route";
import { addContactToGroupRoute } from "./add-contact-to-group/add-contact-to-group.route";
import { addSuppressionRoute } from "./add-suppression/add-suppression.route";
import { createContactRoute } from "./create-contact/create-contact.route";
import { deleteContactRoute } from "./delete-contact/delete-contact.route";
import { exportContactsRoute } from "./export-contacts/export-contacts.route";
import { exportDownloadRoute } from "./export-contacts/export-download.route";
import { exportEmailRoute } from "./export-contacts/export-email.route";
import { exportStatusRoute } from "./export-contacts/export-status.route";
import { getContactRoute } from "./get-contact/get-contact.route";
import { listContactsRoute } from "./list-contacts/list-contacts.route";
import { removeContactFromGroupRoute } from "./remove-contact-from-group/remove-contact-from-group.route";
import { subscriptionActivityRoute } from "./subscription-activity/subscription-activity.route";
import { updateContactRoute } from "./update-contact/update-contact.route";
import { updateContactChannelRoute } from "./update-contact-channel/update-contact-channel.route";

/**
 * Contact routes, served at both `/api/contacts/<route>` (the original,
 * unversioned paths SDKs and integrations use) and `/api/contacts/v1/<route>`,
 * so contacts match every other service's URL versioning. The route modules
 * are unnamed, so Elysia registers them under both prefixes.
 */
function withContactRoutes<const Prefix extends string>(app: Elysia<Prefix>) {
	return app
		.use(createContactRoute)
		.use(getContactRoute)
		.use(listContactsRoute)
		.use(exportContactsRoute)
		.use(exportEmailRoute)
		.use(exportDownloadRoute)
		.use(exportStatusRoute)
		.use(subscriptionActivityRoute)
		.use(updateContactRoute)
		.use(deleteContactRoute)
		.use(addSuppressionRoute)
		.use(addContactToChannelRoute)
		.use(addContactToGroupRoute)
		.use(removeContactFromGroupRoute)
		.use(updateContactChannelRoute);
}

export const contactRoutes = withContactRoutes(
	new Elysia({ name: "ContactRoutes" }),
);

export const contactRoutesV1 = withContactRoutes(
	new Elysia({ name: "ContactRoutesV1", prefix: "/v1" }),
);

/**
 * Unversioned contact paths, hidden from OpenAPI so the reference documents
 * only the /v1 paths. They keep working for existing integrations.
 */
export const legacyContactPaths = [
	...new Set(contactRoutes.routes.map((route) => `/api/contacts${route.path}`)),
];
