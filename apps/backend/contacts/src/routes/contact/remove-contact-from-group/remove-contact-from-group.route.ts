import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { removeContactFromGroupXCodeSamples } from "@reloop/code-samples/contacts";
import { Elysia, t } from "elysia";
import { removeContactFromGroupController } from "./remove-contact-from-group.controllers";

export const removeContactFromGroupRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "remove-group" }),
	)
	.delete(
		"/group/:group_id",
		async ({ body, params, organizationId }) => {
			return await removeContactFromGroupController({
				organizationId,
				groupId: params.group_id,
				contact_id: body.contact_id,
				email: body.email,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				group_id: t.String({
					description: "Group ID",
					examples: ["grp_123456789"],
				}),
			}),
			body: ContactModel.removeContactFromGroupBody,
			response: {
				200: ContactModel.removeContactFromGroupResponse,
				400: t.Object({ message: t.String() }),
				404: t.Object({ message: t.String() }),
			},
			detail: {
				tags: ["Contact"],
				summary: "Delete Contact Group",
				description: "Deletes a contact from a group by ID or email",
				"x-codeSamples": removeContactFromGroupXCodeSamples,
			},
			afterResponse: auditLogHook({
				resourceType: "contact",
				action: "removed_from_group",
				successStatus: 200,
			}),
		},
	);
