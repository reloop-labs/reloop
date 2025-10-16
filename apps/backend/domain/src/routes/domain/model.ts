import { t } from 'elysia'

export namespace DomainModel {
    // Create domain request
    export const createDomainBody = t.Object({
        domain: t.String({ minLength: 1, maxLength: 255 }),
    })

    export type CreateDomainBody = typeof createDomainBody.static

    // Update domain request
    export const updateDomainBody = t.Object({
        mailboxes: t.Optional(t.Number({ minimum: 0 })),
        mailboxQuota: t.Optional(t.Number({ minimum: 0 })),
        quota: t.Optional(t.Number({ minimum: 0 })),
        rateLimit: t.Optional(t.Number({ minimum: 0 })),
        active: t.Optional(t.Boolean()),
    })

    export type UpdateDomainBody = typeof updateDomainBody.static

    // Domain response
    export const domainResponse = t.Object({
        domain: t.String(),
        organizationId: t.String(),
        userId: t.String(),
        mailboxes: t.Number(),
        mailboxQuota: t.Number(),
        quota: t.Number(),
        rateLimit: t.Union([t.Number(), t.Null()]),
        active: t.Boolean(),
        createdAt: t.String(),
        updatedAt: t.String(),
    })

    export type DomainResponse = typeof domainResponse.static

    // Domain list response
    export const domainListResponse = t.Object({
        domains: t.Array(domainResponse),
        total: t.Number(),
        page: t.Number(),
        limit: t.Number(),
    })

    export type DomainListResponse = typeof domainListResponse.static

    // Query parameters for listing domains
    export const domainQuery = t.Object({
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
        active: t.Optional(t.Boolean()),
        organizationId: t.Optional(t.String()),
        userId: t.Optional(t.String()),
    })

    export type DomainQuery = typeof domainQuery.static

    // Error responses
    export const domainNotFound = t.Literal('Domain not found')
    export type DomainNotFound = typeof domainNotFound.static

    export const domainAlreadyExists = t.Literal('Domain already exists')
    export type DomainAlreadyExists = typeof domainAlreadyExists.static

    export const invalidDomain = t.Literal('Invalid domain format')
    export type InvalidDomain = typeof invalidDomain.static

    export const unauthorized = t.Literal('Unauthorized access')
    export type Unauthorized = typeof unauthorized.static
}
