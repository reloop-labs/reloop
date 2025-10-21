import { Elysia, status } from "elysia";
import { authMiddleware } from "../../../middleware/auth";
import { verifyDNSRecordHandler } from "../controllers/verify-dns-record";
import { DNSModel } from "../dns.model";

export const verifyDNSRecordRoute = new Elysia()
    .use(authMiddleware)
    .post(
        "/:domain/verify",
        async ({ params: { domain }, body, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
            }
            return await verifyDNSRecordHandler(domain, body);
        },
        {
            auth: true,
            params: DNSModel.domainParams,
            body: DNSModel.verifyDNSBody,
            response: {
                200: DNSModel.verifyDNSResponse,
                404: DNSModel.dnsRecordNotFound,
            },
            detail: {
                tags: ["DNS"],
                summary: "Verify DNS record",
                description: "Verifies a DNS record for a domain",
            },
        },
    );
