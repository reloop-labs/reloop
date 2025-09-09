import * as schema from "@reloop/db";
import { db, eq } from "@reloop/db";
import { DKIMGenerator, type DNSRecord } from "./dkim";

export interface AddDomainRequest {
	domain: string;
	serverIP: string;
	adminEmail: string;
	adminPassword: string;
	adminFullName: string;
	mailboxes?: number;
	mailboxQuota?: number;
	quota?: number;
	rateLimit?: number;
}

export interface AddDomainResponse {
	success: boolean;
	domain: string;
	dkimKeys: {
		selector: string;
		publicKey: string;
		privateKey: string;
	};
	dnsRecords: DNSRecord[];
	adminAccount: {
		username: string;
		email: string;
		fullName: string;
	};
	message: string;
	isExisting: boolean;
}

export class DomainService {
	static async addDomain(
		request: AddDomainRequest,
	): Promise<AddDomainResponse> {
		const {
			domain,
			serverIP,
			adminEmail,
			adminPassword,
			adminFullName,
			mailboxes = 50,
			mailboxQuota = 5368709120, // 5GB
			quota = 10737418240, // 10GB
			rateLimit = 12,
		} = request;

		try {
			// Check if domain already exists
			const existingDomain = await db.query.domains.findFirst({
				where: eq(schema.domains.domain, domain),
			});

			if (existingDomain) {
				console.log(
					`Domain ${domain} already exists, returning existing details`,
				);

				const existingAliasDomain = await db.query.aliasDomains.findFirst({
					where: eq(schema.aliasDomains.aliasDomain, domain),
				});

				const existingDkimKeys = existingAliasDomain
					? await db.query.dkimKeys.findFirst({
							where: eq(
								schema.dkimKeys.aliasDomain,
								existingAliasDomain.aliasDomain,
							),
						})
					: undefined;

				const existingDnsRecords = existingAliasDomain
					? await db.query.dnsRecords.findMany({
							where: eq(
								schema.dnsRecords.aliasDomain,
								existingAliasDomain.aliasDomain,
							),
						})
					: [];

				const adminLocalPart = adminEmail.split("@")[0];
				const adminUsername = `${adminLocalPart}@${domain}`;
				const existingMailbox = await db.query.mailboxes.findFirst({
					where: eq(schema.mailboxes.username, adminUsername),
				});

				const dnsRecords: DNSRecord[] = existingDnsRecords.map(
					(record: any) => ({
						type: record.recordType,
						name: record.name,
						value: record.value,
						ttl: record.ttl || 3600,
						priority: record.priority,
						description: record.description || "",
					}),
				);

				return {
					success: true,
					domain,
					dkimKeys: {
						selector: existingDkimKeys?.selector || "mail",
						publicKey: existingDkimKeys?.publicKey || "",
						privateKey: existingDkimKeys?.privateKey || "",
					},
					dnsRecords,
					adminAccount: {
						username: existingMailbox?.username || adminUsername,
						email: adminEmail,
						fullName: existingMailbox?.fullName || adminFullName,
					},
					message: `Domain ${domain} already exists. Returning existing configuration.`,
					isExisting: true,
				};
			}

			const dkimKeys = await DKIMGenerator.generateKeyPair("mail", 2048);
			const dnsRecords = DKIMGenerator.generateAllDNSRecords(
				domain,
				serverIP,
				dkimKeys.selector,
			);

			await db.transaction(async (tx: any) => {
				// Insert domain
				await tx.insert(schema.domains).values({
					domain,
					organizationId: "system",
					userId: "system",
					mailboxes,
					mailboxQuota,
					quota,
					rateLimit,
					active: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				// Insert alias domain
				await tx.insert(schema.aliasDomains).values({
					aliasDomain: domain,
					targetDomain: domain,
					userId: "system",
					organizationId: "system",
					active: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				// Insert DKIM keys
				await tx.insert(schema.dkimKeys).values({
					organizationId: "system",
					userId: "system",
					aliasDomain: domain,
					selector: dkimKeys.selector,
					publicKey: dkimKeys.publicKey,
					privateKey: dkimKeys.privateKey,
					keyLength: 2048,
					algorithm: "rsa",
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				// Insert DNS records
				for (const record of dnsRecords) {
					await tx.insert(schema.dnsRecords).values({
						id: Date.now() + Math.random(),
						aliasDomain: domain,
						organizationId: "system",
						userId: "system",
						recordType: record.type,
						name: record.name,
						value: record.value,
						ttl: record.ttl ?? 3600,
						priority: record.priority,
						description: record.description,
						isVerified: false,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}

				// Create admin mailbox
				const adminUsername = `${adminEmail.split("@")[0]}@${domain}`;
				const adminLocalPart = adminEmail.split("@")[0];

				const hashedPassword = await DomainService.hashPassword(adminPassword);

				await tx.insert(schema.mailboxes).values({
					username: adminUsername,
					password: hashedPassword,
					passwordEncode: "MD5-CRYPT",
					fullName: adminFullName,
					isAdmin: true,
					maildir: `${domain}/${adminLocalPart}/`,
					quota: mailboxQuota,
					localPart: adminLocalPart,
					domain,
					active: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				// Create admin alias
				await tx.insert(schema.userAliases).values({
					address: adminUsername,
					goto: adminUsername,
					domain,
					userId: "system",
					organizationId: "system",
					active: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			});

			await DomainService.saveDkimKeyToFile(
				domain,
				dkimKeys.selector,
				dkimKeys.privateKey,
			);

			return {
				success: true,
				domain,
				dkimKeys: {
					selector: dkimKeys.selector,
					publicKey: dkimKeys.publicKey,
					privateKey: dkimKeys.privateKey,
				},
				dnsRecords,
				adminAccount: {
					username: `${adminEmail.split("@")[0]}@${domain}`,
					email: adminEmail,
					fullName: adminFullName,
				},
				message: `Domain ${domain} added successfully with all configurations`,
				isExisting: false,
			};
		} catch (error) {
			throw new Error(`Failed to add domain: ${error}`);
		}
	}

	private static async hashPassword(password: string): Promise<string> {
		try {
			const crypto = await import("crypto");

			const salt = crypto
				.randomBytes(4)
				.toString("base64")
				.replace(/[^a-zA-Z0-9]/g, "")
				.substring(0, 8);
			const hash = crypto
				.createHash("md5")
				.update(password + salt)
				.digest("base64")
				.replace(/[^a-zA-Z0-9]/g, "")
				.substring(0, 22);

			return `$1$${salt}$${hash}`;
		} catch (error) {
			console.error(`Failed to hash password: ${error}`);
			throw new Error("Password hashing failed");
		}
	}

	private static async saveDkimKeyToFile(
		domain: string,
		selector: string,
		privateKey: string,
	): Promise<void> {
		try {
			const fs = await import("fs/promises");
			const path = await import("path");

			const dkimBasePath = "./docker-data/rspamd/dkim";
			const domainPath = path.join(dkimBasePath, domain);
			const keyFilePath = path.join(domainPath, `${selector}.private`);

			await fs.mkdir(domainPath, { recursive: true });
			await fs.writeFile(keyFilePath, privateKey, { mode: 0o600 });

			console.log(`DKIM private key saved to: ${keyFilePath}`);
		} catch (error) {
			console.error(`Failed to save DKIM key to file: ${error}`);
		}
	}
}
