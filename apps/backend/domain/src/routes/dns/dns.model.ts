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

    export const dkimKeysResponse = t.Object({
        selector: t.String(),
        publicKey: t.String(),
        privateKey: t.String(),
        keyLength: t.Number(),
        algorithm: t.String(),
    })

    export const generateDNSBody = t.Object({
        serverIP: t.Optional(t.String({ description: "Server IP address for DNS records" })),
        dkimSelector: t.Optional(t.String({ description: "DKIM selector (default: mail)" })),
    })

    export const verifyDNSBody = t.Object({
        recordType: t.String(),
        name: t.String(),
    })

    export const generateDNSResponse = t.Object({
        message: t.String(),
        domain: t.String(),
        serverIP: t.String(),
        dkimSelector: t.String(),
    })

    export const verifyDNSResponse = t.Object({
        verified: t.Boolean(),
    })

    export const deleteDNSResponse = t.Object({
        message: t.String(),
    })

    // Error responses
    export const dnsRecordsNotFound = t.Literal('DNS records not found')
    export const dkimKeysNotFound = t.Literal('DKIM keys not found')
    export const dnsRecordNotFound = t.Literal('DNS record not found')
    export const unauthorized = t.Literal('User is not a member of an organization')

}
