import { Elysia, status } from "elysia";
import { authMiddleware } from "../../../middleware/auth";
import { getDNSRecordsHandler } from "../controllers/get-dns-records";
import { DNSModel } from "../dns.model";

export const getDNSRecordsRoute = new Elysia()
    .use(authMiddleware)
    .get(
        "/:domain",
        async ({ params: { domain }, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
            }
            return await getDNSRecordsHandler(domain, user.activeOrganizationId);
        },
        {
            auth: true,
            params: DNSModel.domainParams,
            response: {
                200: DNSModel.dnsRecordResponse,
                404: DNSModel.dnsRecordsNotFound,
            },
            detail: {
                tags: ["DNS"],
                summary: "Get DNS records for domain",
                description: "Retrieves all DNS records for a domain",
            },
        },
    );
