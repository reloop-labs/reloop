import { Elysia, status, t } from "elysia";
import { authMiddleware } from "../../middleware/auth";
import { DNSModel } from "./dns.model";
import { DNSServiceHandler } from "./dns.service";

export const dnsRoutes = new Elysia({
    prefix: "/v1/dns",
    name: "DNSRoutes",
})
    .use(authMiddleware)
    .get(
        "/:domain",
        async ({ params: { domain } }) => {
            return await DNSServiceHandler.getDNSRecords(domain);
        },
        {
            auth: true,
            response: {
                200: t.Array(DNSModel.dnsRecordResponse),
                404: DNSModel.dnsRecordsNotFound,
            },
            detail: {
                tags: ["DNS"],
                summary: "Get DNS records for domain",
                description: "Retrieves all DNS records for a domain",
            },
        },
    )
    .get(
        "/:domain/dkim",
        async ({ params: { domain } }) => {
            console.log(`Getting DKIM keys for domain: ${domain}`);
            const keys = await DNSServiceHandler.getDKIMKeys(domain);
            if (!keys) {
                throw status(404, "DKIM keys not found" as const);
            }
            return keys;
        },
        {
            auth: true,
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
    )
    .post(
        "/:domain/verify",
        async ({ params: { domain }, body }) => {
            console.log(`Verifying DNS record for domain: ${domain}`);
            return await DNSServiceHandler.verifyDNSRecord(domain, body);
        },
        {
            auth: true,
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
    )
    .post(
        "/:domain/generate",
        async ({ params: { domain }, body, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, "User is not a member of an organization" as const);
            }
            return await DNSServiceHandler.generateDNSRecords(
                domain,
                user.activeOrganizationId,
                user.id,
                body,
            );
        },
        {
            auth: true,
            body: DNSModel.generateDNSBody,
            response: {
                200: DNSModel.generateDNSResponse,
                403: DNSModel.unauthorized,
            },
            detail: {
                tags: ["DNS"],
                summary: "Generate DNS records for domain",
                description:
                    "Generates and inserts DNS records and DKIM keys for a domain",
            },
        },
    )
    .delete(
        "/:domain",
        async ({ params: { domain } }) => {
            console.log(`Deleting DNS records for domain: ${domain}`);
            return await DNSServiceHandler.deleteDNSRecords(domain);
        },
        {
            auth: true,
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
