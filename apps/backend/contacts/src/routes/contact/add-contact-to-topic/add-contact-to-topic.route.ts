import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { Elysia, t } from "elysia";
import { addContactToTopicController } from "./add-contact-to-topic.controllers";
import { addContactToTopicXCodeSamples } from "./add-contact-to-topic.x-codeSamples";

export const addContactToTopicRoute = new Elysia().use(authMiddleware).post(
  "/topic/:topic_id",
  async ({ body, params, activeOrganizationId, logger, path, request, headers }) => {
    const cookieString = headers["cookie"] || "";
    return await addContactToTopicController({
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
    body: ContactModel.addContactToTopicBody,
    response: {
      201: ContactModel.addContactToTopicResponse,
      404: TopicEnrollmentModel.notFound,
      409: TopicEnrollmentModel.enrollmentAlreadyExists,
      400: ContactModel.invalidEmail,
      403: ContactModel.unauthorized,
    },
    detail: {
      tags: ["Contact"],
      summary: "Add Contact Topic",
      description:
        "Creates a contact (if not exists) and enrolls them in a topic in one operation",
      "x-codeSamples": addContactToTopicXCodeSamples,
    },
  },
);
