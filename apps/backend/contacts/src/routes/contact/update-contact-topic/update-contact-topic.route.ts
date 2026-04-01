import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { updateContactTopicController } from "./update-contact-topic.controllers";
import { updateContactTopicXCodeSamples } from "./update-contact-topic.x-codeSamples";

export const updateContactTopicRoute = new Elysia()
  .use(authMiddleware)
  .patch(
    "/topic/:topic_id",
    async ({ body, params, activeOrganizationId, logger, path, request, headers }) => {
      const cookieString = headers["cookie"] || "";
      return await updateContactTopicController({
        organizationId: activeOrganizationId,
        topicId: params.topic_id,
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
      params: t.Object({ topic_id: t.String() }),
      body: ContactModel.updateContactTopicBody,
      response: {
        200: ContactModel.updateContactTopicResponse,
        400: t.Object({ message: t.String() }),
        404: t.Object({ message: t.String() }),
      },
      detail: {
        tags: ["Contact"],
        summary: "Update Contact Topic",
        description: "Updates a contact's enrollment status in a topic",
        "x-codeSamples": updateContactTopicXCodeSamples,
      },
    },
  );
