import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia } from "elysia";
import { exportContactsController } from "./export-contacts.controllers";

export const exportContactsRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 5,
			windowSeconds: 600,
			namespace: "export-contacts",
		}),
	)
	.get(
		"/export",
		async ({ query, organizationId }) => {
			return await exportContactsController({
				organizationId: organizationId as string,
				query,
			});
		},
		{
			auth: true,
			rateLimit: true,
			query: ContactModel.contactExportQuery,
			detail: {
				tags: ["Contact"],
				summary: "Export Contacts CSV",
				description:
					"Streams matching contacts as CSV with the active filters (search, status, channelId, groupId). Rate-limited to 5 exports per 10 minutes per organization with single-flight guard — use this instead of paging /list for exports.",
			},
		},
	);
