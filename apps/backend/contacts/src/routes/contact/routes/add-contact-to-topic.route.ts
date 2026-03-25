import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { addContactToTopicHandler } from "@be/contacts/routes/contact/controllers/add-contact-to-topic";
import { Elysia } from "elysia";

export const addContactToTopicRoute = new Elysia().use(authMiddleware).post(
	"/add-to-topic",
	async ({ body, activeOrganizationId, userId }) => {
		return await addContactToTopicHandler(activeOrganizationId, userId, body);
	},
	{
		auth: true,
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
		},
	},
);
