import { t } from 'elysia'

export namespace DomainModel {
    export const createDomainBody = t.Object({
        domain: t.String({ minLength: 1, maxLength: 255, description: "Domain name (e.g., send.reloop.com)" }),
    })

    export type CreateDomainBody = typeof createDomainBody.static

    export const domainResponse = t.Object({
        domain: t.String({ description: "Domain name (e.g., send.reloop.com)" }),
        organizationId: t.String(),
        userId: t.String(),
        mailboxes: t.Number(),
        mailboxQuota: t.Number({ description: "Mailbox quota in bytes (default: 5GB)" }),
        quota: t.Number(),
        rateLimit: t.Union([t.Number(), t.Null()]),
        active: t.Boolean(),
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
        active: t.Optional(t.Boolean()),
        organizationId: t.Optional(t.String()),
        userId: t.Optional(t.String()),
    })

    export type DomainQuery = typeof domainQuery.static

    export const domainNotFound = t.Literal('Domain not found')
    export type DomainNotFound = typeof domainNotFound.static

    export const domainAlreadyExists = t.Literal('Domain already exists')
    export type DomainAlreadyExists = typeof domainAlreadyExists.static

    export const invalidDomain = t.Literal('Invalid domain format')
    export type InvalidDomain = typeof invalidDomain.static

    export const unauthorized = t.Literal('Unauthorized access')
    export type Unauthorized = typeof unauthorized.static
}
