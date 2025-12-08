import { authMiddleware } from "@be/audience/middleware/auth";
import { ContactModel } from "@be/audience/model/contact.model";
import { TopicSubscriptionModel } from "@be/audience/model/topic-subscription.model";
import { addContactToTopicHandler } from "@be/audience/routes/audience/controllers/add-contact-to-topic";
import { Elysia } from "elysia";

export const addContactToTopicRoute = new Elysia().use(authMiddleware).post(
  "/add-to-topic",
  async ({ body, user }) => {
    const { activeOrganizationId } = user;
    return await addContactToTopicHandler(activeOrganizationId, body);
  },
  {
    auth: true,
    body: ContactModel.addContactToTopicBody,
    response: {
      201: ContactModel.addContactToTopicResponse,
      404: TopicSubscriptionModel.notFound,
      409: TopicSubscriptionModel.subscriptionAlreadyExists,
      400: ContactModel.invalidEmail,
      403: ContactModel.unauthorized,
    },
    detail: {
      tags: ["Contact"],
      summary: "Add contact to topic",
      description: "Creates a contact (if not exists) and subscribes them to a topic in one operation",
    },
  },
);
