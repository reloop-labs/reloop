import { Elysia, status } from "elysia";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { deleteDNSRecordsHandler } from "@reloop/domain/routes/dns/controllers/delete-dns-records";
import { DNSModel } from "@reloop/domain/routes/dns/dns.model";

export const deleteDNSRecordsRoute = new Elysia()
    .use(authMiddleware)
    .delete(
        "/:domain",
        async ({ params: { domain }, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
            }
            return await deleteDNSRecordsHandler(domain, user.activeOrganizationId);
        },
        {
            auth: true,
            params: DNSModel.domainParams,
            response: {
                200: DNSModel.deleteDNSResponse,
                404: DNSModel.dnsRecordsNotFound,
            },
            detail: {
                tags: ["DNS"],
                summary: "Delete DNS records for domain",
                description: "Deletes all DNS records and DKIM keys for a domain",
            },
        },
    );
