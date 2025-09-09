import { promisify } from "util";
import { createSign, generateKeyPair } from "crypto";

const generateKeyPairAsync = promisify(generateKeyPair);

export interface DKIMKeyPair {
  publicKey: string;
  privateKey: string;
  selector: string;
}

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
  description?: string;
}

export class DKIMGenerator {

  static async generateKeyPair(selector: string = "mail", keyLength: number = 2048): Promise<DKIMKeyPair> {
    try {
      const { publicKey, privateKey } = await generateKeyPairAsync("rsa", {
        modulusLength: keyLength,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });

      return {
        publicKey,
        privateKey,
        selector,
      };
    } catch (error) {
      throw new Error(`Failed to generate DKIM key pair: ${error}`);
    }
  }

  /**
   * Generate DKIM DNS record
   */
  static generateDKIMRecord(domain: string, selector: string, publicKey: string): DNSRecord {
    // Remove PEM headers and format the public key for DNS
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

  /**
   * Generate SPF record
   */
  static generateSPFRecord(domain: string, serverIP: string): DNSRecord {
    const spfValue = `v=spf1 ip4:${serverIP} mx a:${domain} ~all`;

    return {
      type: "TXT",
      name: domain,
      value: spfValue,
      ttl: 3600,
      description: "SPF record for email authentication",
    };
  }

  /**
   * Generate DMARC record
   */
  static generateDMARCRecord(domain: string): DNSRecord {
    const dmarcValue = `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}; ruf=mailto:dmarc@${domain}; sp=quarantine; adkim=r; aspf=r;`;

    return {
      type: "TXT",
      name: `_dmarc.${domain}`,
      value: dmarcValue,
      ttl: 3600,
      description: "DMARC policy for email authentication",
    };
  }

  /**
   * Generate MX record
   */
  static generateMXRecord(domain: string, priority: number = 10): DNSRecord {
    return {
      type: "MX",
      name: domain,
      value: domain,
      priority,
      ttl: 3600,
      description: "Mail exchange record",
    };
  }

  /**
   * Generate A record
   */
  static generateARecord(domain: string, serverIP: string): DNSRecord {
    return {
      type: "A",
      name: domain,
      value: serverIP,
      ttl: 3600,
      description: "Domain A record pointing to mail server",
    };
  }

  /**
   * Generate all DNS records for a domain
   */
  static generateAllDNSRecords(
    domain: string,
    serverIP: string,
    dkimSelector: string = "mail"
  ): DNSRecord[] {
    return [
      this.generateARecord(domain, serverIP),
      this.generateMXRecord(domain),
      this.generateSPFRecord(domain, serverIP),
      this.generateDMARCRecord(domain),
    ];
  }

  /**
   * Generate DKIM signature for testing
   */
  static generateDKIMSignature(
    privateKey: string,
    selector: string,
    domain: string,
    headers: Record<string, string>
  ): string {
    try {
      const sign = createSign("RSA-SHA256");
      
      // Create canonicalized header string
      const canonicalizedHeaders = Object.entries(headers)
        .map(([key, value]) => `${key.toLowerCase()}: ${value}`)
        .join("\r\n");

      // Create DKIM signature`
      const dkimHeader = `DKIM-Signature: v=1; a=rsa-sha256; d=${domain}; s=${selector}; c=relaxed/relaxed; q=dns/txt; t=${Math.floor(Date.now() / 1000)}; h=from:to:subject:date; bh=; b=`;
      
      sign.update(canonicalizedHeaders);
      const signature = sign.sign(privateKey, "base64");
      
      return dkimHeader + signature;
    } catch (error) {
      throw new Error(`Failed to generate DKIM signature: ${error}`);
    }
  }
}
