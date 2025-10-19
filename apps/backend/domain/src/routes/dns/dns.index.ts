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
        async ({ params: { domain }, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
            }
            return await DNSServiceHandler.getDNSRecords(domain, user.activeOrganizationId);
        },
        {
            auth: true,
            params: DNSModel.domainParams,
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
        async ({ params: { domain }, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
            }
            const keys = await DNSServiceHandler.getDKIMKeys(domain, user.activeOrganizationId);
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
    )
    .post(
        "/:domain/verify",
        async ({ params: { domain }, body, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
            }
            return await DNSServiceHandler.verifyDNSRecord(domain, body);
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
    )
    .post(
        "/:domain/generate",
        async ({ params: { domain }, body, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
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
            params: DNSModel.domainParams,
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
        async ({ params: { domain }, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
            }
            return await DNSServiceHandler.deleteDNSRecords(domain, user.activeOrganizationId);
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
