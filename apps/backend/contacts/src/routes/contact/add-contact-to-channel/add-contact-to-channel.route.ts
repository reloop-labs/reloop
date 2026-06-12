import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ChannelSubscriptionModel } from "@be/contacts/model/channel-subscription.model";
import { ContactModel } from "@be/contacts/model/contact.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { Elysia, t } from "elysia";
import { addContactToChannelController } from "./add-contact-to-channel.controllers";
import { addContactToChannelXCodeSamples } from "./add-contact-to-channel.x-codeSamples";

export const addContactToChannelRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "add-channel" }),
	)
	.post(
		"/channel/:channel_id",
		async ({ body, params, organizationId }) => {
			return await addContactToChannelController({
				organizationId,
				channelId: params.channel_id,
				subscription: body.subscription,
				contact_id: body.contact_id,
				email: body.email,
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
			body: ContactModel.addContactToChannelBody,
			response: {
				201: ContactModel.addContactToChannelResponse,
				404: ChannelSubscriptionModel.notFound,
				409: ChannelSubscriptionModel.subscriptionAlreadyExists,
				400: ContactModel.invalidEmail,
				403: ContactModel.unauthorized,
			},
			detail: {
				tags: ["Contact"],
				summary: "Add Contact Channel",
				description:
					"Creates a contact (if not exists) and enrolls them in a channel in one operation",
				"x-codeSamples": addContactToChannelXCodeSamples,
			},
			afterResponse: auditLogHook({
				resourceType: "contact",
				action: "added_to_channel",
				successStatus: 201,
			}),
		},
	);
