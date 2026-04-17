import { Elysia, t } from "elysia";
import { verifyApiKeyController, verifyDomainController } from "./verify.controllers";

export const verifyRoute = new Elysia().post(
  "/verify",
  async ({ body, status }) => {
    const { key, domain } = body;
    const apiKeyResult = await verifyApiKeyController(key);
    if (!apiKeyResult) return status(401, { message: "Invalid API key" });
    const domainResult = await verifyDomainController({ domainName: domain, orgId: apiKeyResult.organizationId, });
    if (!domainResult) { return status(404, { message: "Domain not found" }); }
    return { ...apiKeyResult, ...domainResult, };
  },
  {
    response: {
      200: t.Object({
        userId: t.String(),
        organizationId: t.String(),
        isVerified: t.Boolean(),
      }),
      401: t.Object({
        message: t.String(),
      }),
      404: t.Object({
        message: t.String(),
      }),
    },
    body: t.Object({
      key: t.String(),
      domain: t.String(),
    }),
    detail: {
      summary: "Combined Verification Check",
      description: "Internal verification endpoint mapping POST API keys to their owner and checking domain verification status.",
    },
  },
);
