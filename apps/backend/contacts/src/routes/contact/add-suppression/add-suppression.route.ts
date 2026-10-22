import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { Elysia } from "elysia";
import { addSuppressionController } from "./add-suppression.controllers";

export const addSuppressionRoute = new Elysia().use(authMiddleware).post(
	"/suppressions",
	async ({ body, organizationId, userId }) => {
		return await addSuppressionController({
			organizationId,
			userId,
			email: body.email,
			reason: body.reason,
		});
	},
	{
		auth: true,
		body: ContactModel.addSuppressionBody,
		response: {
			200: ContactModel.suppressionResponse,
			400: ContactModel.invalidEmail,
			403: ContactModel.unauthorized,
			409: ContactModel.alreadySuppressed,
		},
		detail: {
			tags: ["Contact"],
			summary: "Add Suppression",
			description:
				"Adds an email address to the organization's suppression list with a reason. Creates the contact if it does not exist. Sends to the address are rejected until it is removed.",
		},
		afterResponse: auditLogHook({
			resourceType: "contact",
			action: "suppressed",
			successStatus: 200,
		}),
	},
);
