import { db } from "@reloop/db/client";
import { domain, domainDnsRecord } from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export interface DkimConfigResponse {
  domain: string;
  selector: string;
  privateKey: string;
}

/**
 * Fetch DKIM signing config for a domain from the database.
 * Called by KumoMTA's init.lua at message-signing time.
 */
export async function getDkimConfigController({
  domainName,
  logger,
}: {
  domainName: string;
  logger: Logger;
}): Promise<DkimConfigResponse | null> {
  try {
    // Find the domain record
    const domainRecord = await db.query.domain.findFirst({
      where: and(
        eq(domain.domain, domainName),
        eq(domain.status, "active"),
        isNull(domain.deletedAt),
      ),
      columns: {
        id: true,
        domain: true,
      },
    });

    if (!domainRecord) {
      logger.warn(
        { domain: domainName },
        "Domain not found or not active for DKIM config",
      );
      return null;
    }

    // Find the DKIM DNS record with privateKey
    const dkimRecord = await db.query.domainDnsRecord.findFirst({
      where: and(
        eq(domainDnsRecord.domainId, domainRecord.id),
        eq(domainDnsRecord.recordTypeName, "DKIM"),
        isNull(domainDnsRecord.deletedAt),
      ),
      columns: {
        name: true,
        privateKey: true,
      },
    });

    if (!dkimRecord?.privateKey) {
      logger.warn(
        { domain: domainName, domainId: domainRecord.id },
        "No DKIM private key found in database for domain",
      );
      return null;
    }

    // Extract selector from the DKIM record name
    // Format is typically: selector._domainkey.domain.com
    const selectorMatch = dkimRecord.name.match(/^([^.]+)\._domainkey/);
    const selector = selectorMatch?.[1] || "default";

    logger.debug(
      { domain: domainName, selector },
      "DKIM config fetched from database",
    );

    return {
      domain: domainName,
      selector,
      privateKey: dkimRecord.privateKey,
    };
  } catch (error) {
    logger.error(
      {
        domain: domainName,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch DKIM config from database",
    );
    return null;
  }
}
