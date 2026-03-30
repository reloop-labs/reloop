import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { Elysia, t } from "elysia";
import { getDomainController } from "./get-domain.controllers";

export const getDomainRoute = new Elysia().use(authMiddleware).get(
  "/:domain",
  async ({ params: { domain }, activeOrganizationId, logger }) => {
    return await getDomainController({
      domain,
      organizationId: activeOrganizationId,
      logger,
    });
  },
  {
    auth: true,
    params: t.Object({
      domain: DomainModel.domainParam,
    }),
    response: {
      200: DomainModel.domainResponse,
      404: DomainModel.domainNotFound,
      400: DomainModel.invalidDomain,
      403: DomainModel.unauthorized,
    },
    detail: {
      tags: ["Domains"],
      summary: "Get domain by name",
      description: "Retrieves a domain by its domain name",
    },
  },
);
