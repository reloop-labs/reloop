import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { ChannelSubscriptionModel } from "@be/contacts/model/channel-subscription.model";
import { Elysia, t } from "elysia";
import { addContactToChannelController } from "./add-contact-to-channel.controllers";
import { addContactToChannelXCodeSamples } from "./add-contact-to-channel.x-codeSamples";

export const addContactToChannelRoute = new Elysia().use(authMiddleware).post(
  "/channel/:channel_id",
  async ({ body, params, activeOrganizationId, logger, path, request, headers }) => {
    const cookieString = headers["cookie"] || "";
    return await addContactToChannelController({
      organizationId: activeOrganizationId,
      channelId: params.channel_id,
      body,
      logger,
      cookie: cookieString,
      requestDetails: {
        endpoint: path,
        method: request.method,
        userAgent: headers["user-agent"],
        ipAddress: (headers["x-forwarded-for"] as string) || (headers["x-real-ip"] as string),
      },
    });
  },
  {
    auth: true,
    params: t.Object({ channel_id: t.String() }),
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
  },
);
