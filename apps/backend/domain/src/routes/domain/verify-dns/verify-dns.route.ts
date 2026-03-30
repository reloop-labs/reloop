import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { Elysia } from "elysia";
import { verifyDNSRecordController } from "./verify-dns.controllers";
import { verifyDNSXCodeSamples } from "./verify-dns.x-codeSamples";

export const verifyDNSRecordRoute = new Elysia().use(authMiddleware).post(
  "/verify",
  async ({ body, activeOrganizationId, logger }) => {
    const { domain } = body;
    return await verifyDNSRecordController({
      domain,
      organizationId: activeOrganizationId,
      logger,
    });
  },
  {
    auth: true,
    body: DomainModel.createDomainBody,
    response: {
      200: DomainModel.domainResponse,
      400: DomainModel.invalidDomain,
      404: DomainModel.domainNotFound,
      500: DomainModel.invalidDomain,
      403: DomainModel.unauthorized,
    },
    detail: {
      tags: ["Domains"],
      summary: "Verify DNS records",
      description:
        "Verifies DNS records for a domain to check if they are properly configured",
      "x-codeSamples": verifyDNSXCodeSamples,
    },
  },
);
