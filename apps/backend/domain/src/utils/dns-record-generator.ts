import type { DNSTypes } from "../routes/dns/dns.type";

export function generateDKIMRecord(
    domain: string,
    selector: string,
    publicKey: string,
): DNSTypes.DNSRecord {
    const cleanPublicKey = publicKey
        .replace(/-----BEGIN PUBLIC KEY-----/, "")
        .replace(/-----END PUBLIC KEY-----/, "")
        .replace(/\s/g, "");

    const dkimValue = `v=DKIM1; k=rsa; p=${cleanPublicKey}`;

    return {
        type: "TXT",
        name: `${selector}._domainkey.${domain}`,
        value: dkimValue,
        ttl: 3600,
        description: "DKIM public key for email authentication",
    };
}

export function generateSPFRecord(
    domain: string,
    serverDomain: string,
): DNSTypes.DNSRecord {
    const spfValue = `v=spf1 include:${serverDomain} ~all`;

    return {
        type: "TXT",
        name: domain,
        value: spfValue,
        ttl: 3600,
        description: "SPF record for email authentication",
    };
}

export function generateDMARCRecord(domain: string): DNSTypes.DNSRecord {
    const dmarcValue = "v=DMARC1; p=none;";

    return {
        type: "TXT",
        name: `_dmarc.${domain}`,
        value: dmarcValue,
        ttl: 3600,
        description: "DMARC policy for email authentication",
    };
}

export function generateMXRecord(
    domain: string,
    serverDomain: string,
    priority = 10,
): DNSTypes.DNSRecord {
    return {
        type: "MX",
        name: domain,
        value: serverDomain,
        priority,
        ttl: 3600,
        description: "Mail exchange record",
    };
}

export function generateAllDNSRecords(
    domain: string,
    serverDomain: string,
): DNSTypes.DNSRecord[] {
    return [
        generateMXRecord(domain, serverDomain),
        generateSPFRecord(domain, serverDomain),
        generateDMARCRecord(domain),
    ];
}
