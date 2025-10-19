import { t } from "elysia";

export namespace DNSModel {
    // Parameter validation schemas
    export const domainParams = t.Object({
        domain: t.String({
            pattern:
                "^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$",
            description: "Valid domain name or subdomain (e.g., example.com, mail.example.com, api.subdomain.example.com)",
            minLength: 1,
            maxLength: 253,
        }),
    });

    export const dnsRecordResponse = t.Object({
        recordType: t.String(),
        name: t.String(),
        value: t.String(),
        ttl: t.Number(),
        priority: t.Optional(t.Number()),
        description: t.Optional(t.String()),
        isVerified: t.Boolean(),
    });

    export const dkimKeysResponse = t.Object({
        selector: t.String(),
        publicKey: t.String(),
        privateKey: t.String(),
        keyLength: t.Number(),
        algorithm: t.String(),
    });

    export const generateDNSBody = t.Object({
        serverDomain: t.Optional(
            t.String({ description: "Server domain name for DNS records" }),
        ),
        dkimSelector: t.Optional(
            t.String({ description: "DKIM selector (default: mail)" }),
        ),
    });

    export const verifyDNSBody = t.Object({
        recordType: t.String(),
        name: t.String(),
    });

    export const generateDNSResponse = t.Object({
        message: t.String(),
        domain: t.String(),
        serverDomain: t.String(),
        dkimSelector: t.String(),
    });

    export const verifyDNSResponse = t.Object({
        verified: t.Boolean(),
    });

    export const deleteDNSResponse = t.Object({
        message: t.String(),
    });

    // Error responses
    export const dnsRecordsNotFound = t.Object({
        message: t.Literal("DNS records not found")
    });
    export const dkimKeysNotFound = t.Object({
        message: t.Literal("DKIM keys not found")
    });
    export const dnsRecordNotFound = t.Object({
        message: t.Literal("DNS record not found")
    });
    export const unauthorized = t.Object({
        message: t.Literal("User is not a member of an organization")
    });
}
