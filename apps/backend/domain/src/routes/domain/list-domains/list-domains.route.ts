import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { Elysia } from "elysia";
import { listDomainsController } from "./list-domains.controllers";
import { listDomainsXCodeSamples } from "./list-domains.x-codeSamples";

export const listDomainsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, activeOrganizationId, logger, request: { headers }, path, request }) => {
    const cookie = headers.get("cookie") || undefined;
    return await listDomainsController({
      query,
      organizationId: activeOrganizationId,
      logger,
      cookie,
      requestDetails: {
        endpoint: path,
        method: request.method,
        userAgent: headers.get("user-agent") || undefined,
        ipAddress: (headers.get("x-forwarded-for") || headers.get("x-real-ip")) ?? undefined,
      },
    });
  },
  {
    query: DomainModel.domainQuery,
    response: {
      200: DomainModel.domainListResponse,
      403: DomainModel.unauthorized,
    },
    auth: true,
    detail: {
      tags: ["Domains"],
      summary: "List domains",
      description:
        "Retrieves a paginated list of domains with optional filters",
      "x-codeSamples": listDomainsXCodeSamples,
    },
  },
);
