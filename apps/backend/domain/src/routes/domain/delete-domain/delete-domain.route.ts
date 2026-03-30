import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { Elysia, t } from "elysia";
import { deleteDomainController } from "./delete-domain.controllers";
import { deleteDomainXCodeSamples } from "./delete-domain.x-codeSamples";

export const deleteDomainRoute = new Elysia().use(authMiddleware).delete(
  "/:domain_id",
  async ({ params: { domain_id }, activeOrganizationId, logger }) => {
    return await deleteDomainController({
      domainId: domain_id,
      organizationId: activeOrganizationId,
      logger,
    });
  },
  {
    auth: true,
    params: t.Object({
      domain_id: t.String(),
    }),
    response: {
      200: DomainModel.domainResponse,
      404: DomainModel.domainNotFound,
      400: DomainModel.invalidDomain,
      403: DomainModel.unauthorized,
    },
    detail: {
      tags: ["Domains"],
      summary: "Delete domain",
      description: "Deletes a domain and all its associated data",
      "x-codeSamples": deleteDomainXCodeSamples,
    },
  },
);
