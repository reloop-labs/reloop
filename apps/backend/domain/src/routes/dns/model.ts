import { t } from 'elysia'

export namespace DNSModel {
    export const dnsRecordResponse = t.Object({
        recordType: t.String(),
        name: t.String(),
        value: t.String(),
        ttl: t.Number(),
        priority: t.Optional(t.Number()),
        description: t.Optional(t.String()),
        isVerified: t.Boolean(),
    })

    export type DNSRecordResponse = typeof dnsRecordResponse.static

    export const dkimKeysResponse = t.Object({
        selector: t.String(),
        publicKey: t.String(),
        privateKey: t.String(),
        keyLength: t.Number(),
        algorithm: t.String(),
    })

    export type DKIMKeysResponse = typeof dkimKeysResponse.static

    export const generateDNSBody = t.Object({
        serverIP: t.Optional(t.String({ description: "Server IP address for DNS records" })),
        dkimSelector: t.Optional(t.String({ description: "DKIM selector (default: mail)" })),
    })

    export type GenerateDNSBody = typeof generateDNSBody.static

    export const verifyDNSBody = t.Object({
        recordType: t.String(),
        name: t.String(),
    })

    export type VerifyDNSBody = typeof verifyDNSBody.static

    export const generateDNSResponse = t.Object({
        message: t.String(),
        domain: t.String(),
        serverIP: t.String(),
        dkimSelector: t.String(),
    })

    export type GenerateDNSResponse = typeof generateDNSResponse.static

    export const verifyDNSResponse = t.Object({
        verified: t.Boolean(),
    })

    export type VerifyDNSResponse = typeof verifyDNSResponse.static

    export const deleteDNSResponse = t.Object({
        message: t.String(),
    })

    export type DeleteDNSResponse = typeof deleteDNSResponse.static

    // Error responses
    export const dnsRecordsNotFound = t.Literal('DNS records not found')
    export type DNSRecordsNotFound = typeof dnsRecordsNotFound.static

    export const dkimKeysNotFound = t.Literal('DKIM keys not found')
    export type DKIMKeysNotFound = typeof dkimKeysNotFound.static

    export const dnsRecordNotFound = t.Literal('DNS record not found')
    export type DNSRecordNotFound = typeof dnsRecordNotFound.static

    export const unauthorized = t.Literal('User is not a member of an organization')
    export type Unauthorized = typeof unauthorized.static
}
