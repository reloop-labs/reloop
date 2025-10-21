import { Elysia, status } from "elysia";
import { authMiddleware } from "../../../middleware/auth";
import { getDKIMKeysHandler } from "../controllers/get-dkim-keys";
import { DNSModel } from "../dns.model";

export const getDKIMKeysRoute = new Elysia()
    .use(authMiddleware)
    .get(
        "/:domain/dkim",
        async ({ params: { domain }, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
            }
            const keys = await getDKIMKeysHandler(domain, user.activeOrganizationId);
            if (!keys) {
                throw status(404, { message: "DKIM keys not found" });
            }
            return keys;
        },
        {
            auth: true,
            params: DNSModel.domainParams,
            response: {
                200: DNSModel.dkimKeysResponse,
                404: DNSModel.dkimKeysNotFound,
            },
            detail: {
                tags: ["DNS", "DKIM"],
                summary: "Get DKIM keys for domain",
                description: "Retrieves DKIM keys for a domain",
            },
        },
    );
