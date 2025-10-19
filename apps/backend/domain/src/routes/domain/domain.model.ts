import { t } from 'elysia'

export namespace DomainModel {
    export const createDomainBody = t.Object({
        domain: t.String({ minLength: 1, maxLength: 255, description: "Domain name (e.g., send.reloop.com)" }),
    })

    export type CreateDomainBody = typeof createDomainBody.static

    export const domainResponse = t.Object({
        id: t.String({ description: "Unique domain identifier" }),
        domain: t.String({ description: "Domain name (e.g., send.reloop.com)" }),
        organizationId: t.String(),
        userId: t.String(),
        domainType: t.Union([t.Literal("custom"), t.Literal("subdomain"), t.Literal("system")], { description: "Type of domain" }),
        status: t.Union([t.Literal("start-verify"), t.Literal("verifying"), t.Literal("active"), t.Literal("suspended"), t.Literal("failed")], { description: "Domain verification status" }),
        userVerified: t.Boolean({ description: "Whether user has verified the domain" }),
        systemVerified: t.Boolean({ description: "Whether system has verified the domain" }),
        dnsConfigured: t.Boolean({ description: "Whether DNS is properly configured" }),
        nameservers: t.Union([t.Array(t.String()), t.Null()], { description: "Domain nameservers" }),
        spfRecord: t.Union([t.String(), t.Null()], { description: "SPF DNS record" }),
        dkimRecord: t.Union([t.String(), t.Null()], { description: "DKIM DNS record" }),
        dkimSelector: t.String({ description: "DKIM selector (default: reloop)" }),
        dmarcRecord: t.Union([t.String(), t.Null()], { description: "DMARC DNS record" }),
        dmarcPolicy: t.String({ description: "DMARC policy (default: none)" }),
        trackingDomain: t.Boolean({ description: "Whether domain is used for tracking" }),
        verificationFailedReason: t.Union([t.String(), t.Null()], { description: "Reason for verification failure" }),
        deletedAt: t.Union([t.String(), t.Null()], { description: "Soft delete timestamp" }),
        lastVerifiedAt: t.Union([t.String(), t.Null()], { description: "Last verification timestamp" }),
        createdAt: t.String(),
        updatedAt: t.String(),
    })

    export type DomainResponse = typeof domainResponse.static

    export const domainListResponse = t.Object({
        domains: t.Array(domainResponse),
        total: t.Number(),
        page: t.Number(),
        limit: t.Number(),
    })

    export type DomainListResponse = typeof domainListResponse.static

    export const domainQuery = t.Object({
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
        status: t.Optional(t.Union([t.Literal("start-verify"), t.Literal("verifying"), t.Literal("active"), t.Literal("suspended"), t.Literal("failed")])),
        organizationId: t.Optional(t.String()),
        userId: t.Optional(t.String()),
    })

    export type DomainQuery = typeof domainQuery.static

    export const domainNotFound = t.Object({
        message: t.Literal('Domain not found')
    })
    export type DomainNotFound = typeof domainNotFound.static

    export const domainAlreadyExists = t.Object({
        message: t.Literal('Domain already exists')
    })
    export type DomainAlreadyExists = typeof domainAlreadyExists.static

    export const invalidDomain = t.Object({
        message: t.Literal('Invalid domain format')
    })
    export type InvalidDomain = typeof invalidDomain.static

    export const unauthorized = t.Object({
        message: t.Literal('Unauthorized access')
    })
    export type Unauthorized = typeof unauthorized.static
}
