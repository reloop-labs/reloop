import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { Elysia } from "elysia";
import { createPropertyController } from "./create-property.controllers";
import { createPropertyXCodeSamples } from "./create-property.x-codeSamples";

export const createPropertyRoute = new Elysia().use(authMiddleware).post(
  "/create",
  async ({ body, activeOrganizationId, userId, logger, cookie, path, request, headers }) => {
    const cookieString = cookie?.toString() || "";
    return createPropertyController({
      activeOrganizationId,
      userId,
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
    body: PropertyModel.createPropertyBody,
    response: {
      200: PropertyModel.propertyResponse,
      409: PropertyModel.propertyAlreadyExists,
      401: PropertyModel.unauthorized,
    },
    detail: {
      tags: ["Contact Properties"],
      summary: "Create Contact Property",
      description:
        "Create a new custom property for contacts in the organization",
      "x-codeSamples": createPropertyXCodeSamples,
    },
  },
);
