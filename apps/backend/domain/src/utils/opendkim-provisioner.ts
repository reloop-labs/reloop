import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { eq, and } from "drizzle-orm";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const OPENDKIM_KEYS_DIR = process.env.OPENDKIM_KEYS_DIR || "/etc/opendkim/keys";
const OPENDKIM_KEY_TABLE = process.env.OPENDKIM_KEY_TABLE || "/etc/opendkim/KeyTable";
const OPENDKIM_SIGNING_TABLE = process.env.OPENDKIM_SIGNING_TABLE || "/etc/opendkim/SigningTable";
const OPENDKIM_TRUSTED_HOSTS = process.env.OPENDKIM_TRUSTED_HOSTS || "/etc/opendkim/TrustedHosts";

/**
 * Provision DKIM keys for a domain in the OpenDKIM service
 * This function writes the DKIM private key to the filesystem and updates
 * OpenDKIM configuration files (KeyTable, SigningTable, TrustedHosts)
 */
export async function provisionDKIMForDomain(domain: string): Promise<void> {
	logger.info({ domain }, "Provisioning DKIM keys for domain");

	try {
		// Get domain record with DKIM keys from database
		const domainRecord = await db
			.select({
				dkimSelector: schema.domain.dkimSelector,
				dkimPrivateKey: schema.domain.dkimPrivateKey,
			})
			.from(schema.domain)
			.where(eq(schema.domain.domain, domain))
			.limit(1);

		if (domainRecord.length === 0 || !domainRecord[0]) {
			logger.warn({ domain }, "Domain not found when provisioning DKIM");
			throw new Error(`Domain ${domain} not found`);
		}

		const record = domainRecord[0];
		if (!record.dkimPrivateKey) {
			logger.warn({ domain }, "No DKIM private key found for domain");
			throw new Error(`No DKIM private key found for domain ${domain}`);
		}

		const selector = record.dkimSelector || "mail";
		const privateKey = record.dkimPrivateKey as string;

		// Create domain-specific key directory
		const domainKeyDir = join(OPENDKIM_KEYS_DIR, domain);
		await mkdir(domainKeyDir, { recursive: true });

		// Write private key to file
		const privateKeyPath = join(domainKeyDir, `${selector}.private`);
		await writeFile(privateKeyPath, privateKey, { mode: 0o600 });

		logger.info(
			{ domain, selector, privateKeyPath },
			"DKIM private key written to filesystem",
		);

		// Update KeyTable: format is "selector._domainkey.domain domain:selector:keyfile"
		const keyTableEntry = `${selector}._domainkey.${domain} ${domain}:${selector}:${privateKeyPath}\n`;
		
		// Update SigningTable: format is "*@domain selector._domainkey.domain"
		const signingTableEntry = `*@${domain} ${selector}._domainkey.${domain}\n`;
		
		// Update TrustedHosts: add the domain
		const trustedHostsEntry = `${domain}\n*.${domain}\n`;

		// Append to OpenDKIM configuration files
		// Note: In production, these files should be managed more carefully
		// Consider using a file locking mechanism or atomic writes
		try {
			await writeFile(OPENDKIM_KEY_TABLE, keyTableEntry, { flag: "a" });
			await writeFile(OPENDKIM_SIGNING_TABLE, signingTableEntry, { flag: "a" });
			await writeFile(OPENDKIM_TRUSTED_HOSTS, trustedHostsEntry, { flag: "a" });

			logger.info(
				{ domain, selector },
				"OpenDKIM configuration files updated successfully",
			);
		} catch (error) {
			logger.error(
				{
					domain,
					selector,
					error: error instanceof Error ? error.message : String(error),
				},
				"Failed to update OpenDKIM configuration files",
			);
			throw new Error(
				`Failed to update OpenDKIM configuration files: ${error}`,
			);
		}

		logger.info(
			{ domain, selector },
			"DKIM provisioning completed successfully",
		);
	} catch (error) {
		logger.error(
			{
				domain,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error provisioning DKIM for domain",
		);
		throw error;
	}
}

/**
 * Remove DKIM provisioning for a domain
 * This is useful when a domain is deleted or DKIM needs to be reset
 */
export async function deprovisionDKIMForDomain(domain: string): Promise<void> {
	logger.info({ domain }, "Deprovisioning DKIM keys for domain");

	try {
		// Note: In a production environment, you would need to:
		// 1. Remove entries from KeyTable, SigningTable, and TrustedHosts
		// 2. Delete the private key file from the filesystem
		// 3. Reload or restart OpenDKIM service
		
		// This is a placeholder implementation
		// You may want to use proper file parsing and rewriting logic
		logger.warn(
			{ domain },
			"DKIM deprovisioning is not fully implemented",
		);
	} catch (error) {
		logger.error(
			{
				domain,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deprovisioning DKIM for domain",
		);
		throw error;
	}
}
