import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { Elysia, t } from "elysia";
import { updateContactChannelController } from "./update-contact-channel.controllers";
import { updateContactChannelXCodeSamples } from "@reloop/code-samples/contacts";

export const updateContactChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "update-channel",
		}),
	)
	.patch(
		"/channel/:channel_id",
		async ({ body, params, organizationId }) => {
			return await updateContactChannelController({
				organizationId,
				channelId: params.channel_id,
				contact_id: body.contact_id,
				email: body.email,
				subscription: body.subscription,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				channel_id: t.String({
					description: "Channel ID",
					examples: ["channel_123456789"],
				}),
			}),
			body: ContactModel.updateContactChannelBody,
			response: {
				200: ContactModel.updateContactChannelResponse,
				400: t.Object({ message: t.String() }),
				404: t.Object({ message: t.String() }),
			},
			detail: {
				tags: ["Contact"],
				summary: "Update Contact Channel",
				description: "Updates a contact's enrollment status in a channel",
				"x-codeSamples": updateContactChannelXCodeSamples,
			},
			afterResponse: auditLogHook({
				resourceType: "contact",
				action: "updated_channel",
				successStatus: 200,
			}),
		},
	);
