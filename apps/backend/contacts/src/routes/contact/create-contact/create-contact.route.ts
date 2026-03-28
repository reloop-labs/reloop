import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia } from "elysia";
import { createContactController } from "./create-contact.controllers";
import { createContactXCodeSamples } from "./create-contact.x-codeSamples";

export const createContactRoute = new Elysia().use(authMiddleware).post(
  "/create",
  async ({ body, activeOrganizationId, userId, logger }) => {
    return await createContactController({
      organizationId: activeOrganizationId,
      userId,
      body: { ...body, object: "contact" },
      logger,
    });
  },
  {
    auth: true,
    body: ContactModel.createContactBody,
    response: {
      201: ContactModel.contactResponse,
      409: ContactModel.contactAlreadyExists,
      400: ContactModel.invalidEmail,
      403: ContactModel.unauthorized,
    },
    detail: {
      tags: ["Contact"],
      summary: "Create Contact",
      description: "Creates contact",
      "x-codeSamples": createContactXCodeSamples,
    },
  },
);
