import { domainErrorResponse } from "@be/domain/error/domain.error-response";
import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { Elysia } from "elysia";
import { createDomainController } from "./create-domain.controllers";

export const createDomainRoute = new Elysia().use(authMiddleware).post(
  "/create",
  async ({ body, activeOrganizationId, userId, logger }) => {
    try {
      return await createDomainController({
        organizationId: activeOrganizationId,
        domain: body.domain,
        customReturnPath: body.customReturnPath,
        clickTracking: body.clickTracking,
        openTracking: body.openTracking,
        tls: body.tls,
        userId,
        logger,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      domainErrorResponse(errorMessage);
    }
  },
  {
    auth: true,
    body: DomainModel.createDomainBody,
    response: {
      201: DomainModel.domainResponse,
      409: DomainModel.domainAlreadyExists,
      400: DomainModel.invalidDomain,
      403: DomainModel.unauthorized,
    },
    detail: {
      tags: ["Domains"],
      summary: "Add a new domain",
      description: "Adds a new domain to the user's organization",
    },
  },
);
