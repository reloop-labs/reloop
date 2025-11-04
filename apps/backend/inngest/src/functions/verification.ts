import * as dns from "node:dns/promises";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

// Domain verification workflow
export const verifyDomain = inngest.createFunction(
	{
		id: "verify-domain",
		name: "Verify Domain",
		retries: 3,
	},
	{
		event: "verify/domain",
	},
	async ({
		event,
		step,
	}: {
		event: {
			data: { domainId: string; domain: string; organizationId: string };
		};
		step: any;
	}) => {
		const { domainId, domain, organizationId } = event.data;

		// Fetch domain details
		const domainRecord = await step.run("fetch-domain", async () => {
			const domainData = await db.query.domain.findFirst({
				where: and(
					eq(schema.domain.id, domainId),
					eq(schema.domain.organizationId, organizationId),
					isNull(schema.domain.deletedAt),
				),
				with: {
					dnsRecords: true,
				},
			});

			if (!domainData) {
				throw new Error(`Domain not found: ${domainId}`);
			}

			return domainData;
		});

		// Check DNS records
		const dnsStatus = await step.run("check-dns-records", async () => {
			const requiredRecords = ["SPF", "DKIM", "DMARC"];
			const records = domainRecord.dnsRecords || [];
			const foundRecords = new Set(
				records
					.filter((r: { recordType: string }) =>
						requiredRecords.includes(r.recordType),
					)
					.map((r: { recordType: string }) => r.recordType),
			);

			const allFound = requiredRecords.every((type) => foundRecords.has(type));

			return {
				allFound,
				foundRecords: Array.from(foundRecords),
				missingRecords: requiredRecords.filter(
					(type) => !foundRecords.has(type),
				),
			};
		});

		// Update domain status
		await step.run("update-domain-status", async () => {
			if (dnsStatus.allFound) {
				await db
					.update(schema.domain)
					.set({
						status: "active",
						dnsConfigured: true,
						systemVerified: true,
						lastVerifiedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(schema.domain.id, domainId));

				logger.info({ domainId, domain }, "Domain verified successfully");
			} else {
				await db
					.update(schema.domain)
					.set({
						status: "start-verify",
						dnsConfigured: false,
						verificationFailedReason: `Missing DNS records: ${dnsStatus.missingRecords.join(", ")}`,
						lastVerifiedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(schema.domain.id, domainId));

				logger.warn(
					{
						domainId,
						domain,
						missingRecords: dnsStatus.missingRecords,
					},
					"Domain verification failed - missing DNS records",
				);
			}
		});

		return {
			domainId,
			domain,
			verified: dnsStatus.allFound,
			missingRecords: dnsStatus.missingRecords,
		};
	},
);

// DNS record verification workflow
export const verifyDNSRecord = inngest.createFunction(
	{
		id: "verify-dns-record",
		name: "Verify DNS Record",
		retries: 5,
	},
	{
		event: "verify/dns-record",
	},
	async ({
		event,
		step,
	}: {
		event: {
			data: {
				dnsRecordId: string;
				domainId: string;
				recordType: string;
				name: string;
				value: string;
				organizationId: string;
			};
		};
		step: any;
	}) => {
		const {
			dnsRecordId,
			domainId: _domainId,
			recordType,
			name,
			value: _value,
			organizationId,
		} = event.data;

		// Fetch DNS record
		const dnsRecord = await step.run("fetch-dns-record", async () => {
			const record = await db.query.domainDnsRecord.findFirst({
				where: and(
					eq(schema.domainDnsRecord.id, dnsRecordId),
					eq(schema.domainDnsRecord.organizationId, organizationId),
					isNull(schema.domainDnsRecord.deletedAt),
				),
				with: {
					domain: true,
				},
			});

			if (!record) {
				throw new Error(`DNS record not found: ${dnsRecordId}`);
			}

			return record;
		});

		// Verify DNS record with actual DNS lookup
		const verified = await step.run("perform-dns-lookup", async () => {
			try {
				logger.info(
					{
						dnsRecordId,
						domain: dnsRecord.domain.domain,
						recordType,
						name,
						expectedValue: dnsRecord.value,
					},
					"Performing DNS lookup",
				);

				const maxRetries = 3;
				let lastError: Error | null = null;

				// Retry logic with exponential backoff
				for (let attempt = 0; attempt < maxRetries; attempt++) {
					try {
						if (attempt > 0) {
							const delay = 2 ** (attempt - 1) * 1000; // 1s, 2s, 4s
							await new Promise((resolve) => setTimeout(resolve, delay));
						}

						let found = false;
						const expectedValue = dnsRecord.value;

						// Perform DNS lookup based on record type
						switch (recordType.toUpperCase()) {
							case "TXT":
							case "SPF":
							case "DKIM":
							case "DMARC":
								{
									const records = await Promise.race([
										dns.resolveTxt(name),
										new Promise<never>((_, reject) =>
											setTimeout(
												() => reject(new Error("DNS query timeout")),
												10000, // 10 second timeout
											),
										),
									]);

									// Flatten TXT records (they come as arrays of strings)
									const flattenedRecords = records.flat();
									// Check if any record contains the expected value
									found = flattenedRecords.some((record) =>
										Array.isArray(record)
											? record.join("").includes(expectedValue)
											: record.includes(expectedValue),
									);

									// For SPF/DKIM/DMARC, also check if the record starts with the correct prefix
									if (!found && recordType.toUpperCase() !== "TXT") {
										const prefix =
											recordType.toUpperCase() === "SPF"
												? "v=spf1"
												: recordType.toUpperCase() === "DKIM"
													? "v=DKIM1"
													: "v=DMARC1";

										found = flattenedRecords.some((record) => {
											const recordStr = Array.isArray(record)
												? record.join("")
												: record;
											return (
												recordStr.includes(expectedValue) ||
												recordStr.startsWith(prefix)
											);
										});
									}
								}
								break;

							case "MX":
								{
									const records = await Promise.race([
										dns.resolveMx(name),
										new Promise<never>((_, reject) =>
											setTimeout(
												() => reject(new Error("DNS query timeout")),
												10000,
											),
										),
									]);

									// Check if any MX record matches the expected exchange
									found = records.some(
										(mx) =>
											mx.exchange.toLowerCase() ===
												expectedValue.toLowerCase() ||
											mx.exchange
												.toLowerCase()
												.endsWith(`.${expectedValue.toLowerCase()}`),
									);
								}
								break;

							case "A":
								{
									const records = await Promise.race([
										dns.resolve4(name),
										new Promise<never>((_, reject) =>
											setTimeout(
												() => reject(new Error("DNS query timeout")),
												10000,
											),
										),
									]);

									found = records.some((ip) => ip === expectedValue);
								}
								break;

							case "AAAA":
								{
									const records = await Promise.race([
										dns.resolve6(name),
										new Promise<never>((_, reject) =>
											setTimeout(
												() => reject(new Error("DNS query timeout")),
												10000,
											),
										),
									]);

									found = records.some((ip) => ip === expectedValue);
								}
								break;

							case "CNAME":
								{
									const records = await Promise.race([
										dns.resolveCname(name),
										new Promise<never>((_, reject) =>
											setTimeout(
												() => reject(new Error("DNS query timeout")),
												10000,
											),
										),
									]);

									found = records.some((cname) => cname === expectedValue);
								}
								break;

							default:
								logger.warn(
									{ recordType, dnsRecordId },
									"Unsupported record type for DNS verification",
								);
								// For unsupported types, return true to avoid blocking
								return true;
						}

						if (found) {
							logger.info(
								{ dnsRecordId, recordType, name },
								"DNS record verified successfully",
							);
							return true;
						}
						logger.warn(
							{
								dnsRecordId,
								recordType,
								name,
								expectedValue,
							},
							"DNS record not found or value mismatch",
						);
						return false;
					} catch (error) {
						lastError =
							error instanceof Error ? error : new Error(String(error));

						// Don't retry on certain errors
						if (
							lastError.message.includes("ENOTFOUND") ||
							lastError.message.includes("ENODATA")
						) {
							break;
						}

						if (attempt < maxRetries - 1) {
							logger.warn(
								{
									dnsRecordId,
									attempt: attempt + 1,
									maxRetries,
									error: lastError.message,
								},
								"DNS lookup failed, retrying",
							);
						}
					}
				}

				logger.error(
					{
						dnsRecordId,
						error: lastError?.message || "Unknown error",
					},
					"DNS lookup failed after retries",
				);
				return false;
			} catch (error) {
				logger.error(
					{
						dnsRecordId,
						error: error instanceof Error ? error.message : String(error),
					},
					"DNS lookup failed",
				);
				return false;
			}
		});

		// Update DNS record status
		await step.run("update-dns-record-status", async () => {
			const verificationError = verified
				? null
				: `DNS record verification failed: Expected value not found for ${recordType} record at ${name}`;

			await db
				.update(schema.domainDnsRecord)
				.set({
					isVerified: verified,
					isActive: verified ? true : false,
					status: verified ? "active" : "failed",
					verificationError,
					updatedAt: new Date(),
				})
				.where(eq(schema.domainDnsRecord.id, dnsRecordId));

			if (verified) {
				logger.info(
					{ dnsRecordId, recordType, name },
					"DNS record verified successfully",
				);
			} else {
				logger.warn(
					{ dnsRecordId, recordType, name, expectedValue: dnsRecord.value },
					"DNS record verification failed",
				);
			}
		});

		return {
			dnsRecordId,
			verified,
		};
	},
);
