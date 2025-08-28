import { eq, and } from "drizzle-orm";
import nodemailer from "nodemailer";
import Imap from "node-imap";
import { simpleParser } from "mailparser";
import fs from "fs";
import path from "path";
import { db } from "../db/connection";
import { virtualDomains, virtualUsers, virtualAliases } from "../db/schema";
import {
	generateSSHA512Password,
	generateDKIMKeys,
	generateDNSRecords,
	restartMailServices,
	removeDirectory,
	removeFile,
} from "../utils/mail";
import type {
	SendMailRequest,
	SendMailResponse,
	AddDomainRequest,
	AddDomainResponse,
	RemoveDomainRequest,
	RemoveDomainResponse,
	AddUserRequest,
	AddUserResponse,
	RemoveUserRequest,
	RemoveUserResponse,
	GetMailsRequest,
	GetMailsResponse,
	GetMailsIMAPRequest,
	GetMailsIMAPResponse,
} from "../types/mail";

// Send Mail Service
export async function sendMail(data: SendMailRequest): Promise<SendMailResponse> {
	const transporter = nodemailer.createTransporter({
		host: process.env.MAIL_HOST,
		port: Number(process.env.MAIL_PORT),
		secure: process.env.MAIL_SECURE === "true",
		auth: {
			user: data.user,
			pass: data.passwd,
		},
		tls: {
			rejectUnauthorized: process.env.MAIL_TLS_REJECT_UNAUTHORIZED === "true",
		},
	});

	const info = await transporter.sendMail({
		from: data.from,
		to: data.to,
		subject: data.subject,
		text: data.text,
		html: data.html,
	});

	return { success: true, messageId: info.messageId };
}

// Add Domain Service
export async function addDomain(data: AddDomainRequest): Promise<AddDomainResponse> {
	const { domain, mail, password } = data;
	const selector = "mail";

	if (!domain || !mail || !password) {
		throw new Error("Domain, primary mail address, and password are required.");
	}

	const [username] = mail.split("@");

	// Insert domain
	const [domainResult] = await db
		.insert(virtualDomains)
		.values({ name: domain })
		.returning({ id: virtualDomains.id });

	const domainId = domainResult.id;

	const hashedPassword = generateSSHA512Password(password);

	// Insert primary user
	await db.insert(virtualUsers).values({
		domainId,
		email: mail,
		password: hashedPassword,
	});

	// Insert alias for primary user
	await db.insert(virtualAliases).values({
		domainId,
		source: mail,
		destination: mail,
	});


	const valuepubkey = generateDKIMKeys(domain, selector);

	const records = generateDNSRecords(domain, selector, valuepubkey);

	restartMailServices();

	return { success: true, dns: records };
}

// Remove Domain Service
export async function removeDomain(data: RemoveDomainRequest): Promise<RemoveDomainResponse> {
	const { domain } = data;
	const selector = "mail";

	if (!domain) {
		throw new Error("Domain is required.");
	}

	//(cascade will delete related data from users and aliases)
	const deleteResult = await db
		.delete(virtualDomains)
		.where(eq(virtualDomains.name, domain))
		.returning({ id: virtualDomains.id });

	if (deleteResult.length === 0) {
		throw new Error("Domain not found.");
	}

	const mailboxBasePath = `/var/mail/vhosts/${domain}`;
	const keyPath = `/var/lib/rspamd/dkim/${domain}/${selector}.private`;
	const pubPath = `/var/lib/rspamd/dkim/${domain}/${selector}.pub`;

	removeDirectory(mailboxBasePath);
	removeFile(keyPath);
	removeFile(pubPath);


	restartMailServices();

	return { success: true, message: `${domain} and associated data removed successfully.` };
}

// Add User Service
export async function addUser(data: AddUserRequest): Promise<AddUserResponse> {
	const { domain, username, password, aliases = [] } = data;
	const mainAddress = `${username}@${domain}`;

	if (!domain || !username || !password) {
		throw new Error("Domain, username, and password are required.");
	}

	const domainResult = await db
		.select({ id: virtualDomains.id })
		.from(virtualDomains)
		.where(eq(virtualDomains.name, domain))
		.limit(1);

	if (domainResult.length === 0) {
		throw new Error("Domain not found.");
	}

	const domainId = domainResult[0].id;

	const hashedPassword = generateSSHA512Password(password);

	await db.insert(virtualUsers).values({
		domainId,
		email: mainAddress,
		password: hashedPassword,
	});


	const allAliases = Array.from(
		new Set([mainAddress, ...aliases.map((a) => `${a}@${domain}`)])
	);

	for (const alias of allAliases) {
		// Check if alias exists
		const existingAlias = await db
			.select({ id: virtualAliases.id, destination: virtualAliases.destination })
			.from(virtualAliases)
			.where(and(eq(virtualAliases.domainId, domainId), eq(virtualAliases.source, alias)))
			.limit(1);

		if (existingAlias.length > 0) {
			// Update existing alias
			const currentDestinations = existingAlias[0].destination.split(",");
			if (!currentDestinations.includes(mainAddress)) {
				currentDestinations.push(mainAddress);
				await db
					.update(virtualAliases)
					.set({ destination: currentDestinations.join(",") })
					.where(eq(virtualAliases.id, existingAlias[0].id));
			}
		} else {
			await db.insert(virtualAliases).values({
				domainId,
				source: alias,
				destination: mainAddress,
			});
		}
	}

	restartMailServices();

	return {
		success: true,
		user: mainAddress,
		aliases: allAliases,
		message: "User and aliases added/updated successfully.",
	};
}

// Remove User Service
export async function removeUser(data: RemoveUserRequest): Promise<RemoveUserResponse> {
	const { domain, username } = data;
	const mainAddress = `${username}@${domain}`;

	if (!domain || !username) {
		throw new Error("Domain and username are required.");
	}

	const domainResult = await db
		.select({ id: virtualDomains.id })
		.from(virtualDomains)
		.where(eq(virtualDomains.name, domain))
		.limit(1);

	if (domainResult.length === 0) {
		throw new Error("Domain not found.");
	}

	const domainId = domainResult[0].id;

	// Delete user
	const deleteUserResult = await db
		.delete(virtualUsers)
		.where(and(eq(virtualUsers.domainId, domainId), eq(virtualUsers.email, mainAddress)))
		.returning({ id: virtualUsers.id });

	if (deleteUserResult.length === 0) {
		throw new Error("User not found.");
	}

	// Update aliases that pointed to this user
	const aliases = await db
		.select({ id: virtualAliases.id, destination: virtualAliases.destination })
		.from(virtualAliases)
		.where(eq(virtualAliases.domainId, domainId));

	for (const alias of aliases) {
		const destinations = alias.destination.split(",");
		const filteredDestinations = destinations.filter((dest) => dest !== mainAddress);
		
		if (filteredDestinations.length === 0) {
			// Remove alias if no destinations left
			await db.delete(virtualAliases).where(eq(virtualAliases.id, alias.id));
		} else {
			// Update alias with remaining destinations
			await db
				.update(virtualAliases)
				.set({ destination: filteredDestinations.join(",") })
				.where(eq(virtualAliases.id, alias.id));
		}
	}

	const mailboxPath = `/var/mail/vhosts/${domain}/${username}/Maildir`;
	removeDirectory(mailboxPath);

	restartMailServices();

	return {
		success: true,
		user: mainAddress,
		message: "User and associated aliases/data removed successfully.",
	};
}

// Get Mails from Maildir
export async function getMailsFromMaildir(data: GetMailsRequest): Promise<GetMailsResponse> {
	const { email } = data;

	if (!email || !email.includes("@")) {
		throw new Error("Invalid email provided");
	}

	const [user, domain] = email.split("@");
	const mailboxPath = `/var/mail/vhosts/${domain}/${user}/Maildir/cur`;

	if (!fs.existsSync(mailboxPath)) {
		throw new Error("Mailbox not found for this user.");
	}

	const files = fs.readdirSync(mailboxPath);
	const mails = [];

	for (const file of files) {
		const filePath = path.join(mailboxPath, file);
		const content = fs.readFileSync(filePath, "utf8");

		const subjectMatch = content.match(/^Subject: (.*)$/m);
		const fromMatch = content.match(/^From: (.*)$/m);
		const dateMatch = content.match(/^Date: (.*)$/m);

		mails.push({
			subject: subjectMatch ? subjectMatch[1] : "(No Subject)",
			from: fromMatch ? fromMatch[1] : "(Unknown Sender)",
			date: dateMatch ? dateMatch[1] : "(Unknown Date)",
			preview: content.split("\n").slice(-10).join("\n"),
			fileName: file,
		});
	}

	return { success: true, count: mails.length, mails };
}

// Get Mails via IMAP
export async function getMailsViaIMAP(data: GetMailsIMAPRequest): Promise<GetMailsIMAPResponse> {
	const { user, password, count = 10, mailbox = "INBOX" } = data;

	if (!user || !password) {
		throw new Error("User and password are required.");
	}

	return new Promise((resolve, reject) => {
		const imapConfig = {
			user: user,
			password: password,
			host: process.env.MAIL_HOST,
			port: 993,
			tls: true,
			tlsOptions: { servername: process.env.MAIL_HOST },
		};

		const imap = new Imap(imapConfig);
		const fetchedEmails: any[] = [];

		imap.once("ready", () => {
			imap.openBox(mailbox, false, (err, box) => {
				if (err) {
					imap.end();
					return reject(new Error(`Failed to open mailbox: ${err.message}`));
				}

				const fetchCount = Math.min(count, box.messages.total);
				if (fetchCount === 0) {
					imap.end();
					return resolve({ success: true, emails: [] });
				}

				const fetchOptions = {
					bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
					struct: true,
				};

				const f = imap.seq.fetch(`${box.messages.total - fetchCount + 1}:*`, fetchOptions);

				f.on("message", (msg, seqno) => {
					let emailData: any = {};
					const chunks: Buffer[] = [];

					msg.on("body", (stream, info) => {
						stream.on("data", (chunk) => chunks.push(chunk));
						stream.once("end", () => {
							const buffer = Buffer.concat(chunks);
							simpleParser(buffer, (err, parsed) => {
								if (err) {
									console.error(`Error parsing email ${seqno}:`, err);
								} else {
									emailData = {
										uid: msg.attributes ? msg.attributes.uid : null,
										seqno: seqno,
										from: parsed.from ? parsed.from.text : "N/A",
										to: parsed.to ? parsed.to.text : "N/A",
										subject: parsed.subject || "No Subject",
										date: parsed.date ? parsed.date.toISOString() : "N/A",
										text: parsed.text || "",
										html: parsed.html || "",
										headers: parsed.headers,
									};
									fetchedEmails.push(emailData);
								}
							});
						});
					});

					msg.once("attributes", (attrs) => {
						// Attributes contain flags, UID, etc.
					});

					msg.once("end", () => {
						// console.log(`Finished message ${seqno}`);
					});
				});

				f.once("error", (err) => {
					imap.end();
					reject(new Error(`Failed to fetch emails: ${err.message}`));
				});

				f.once("end", () => {
					fetchedEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
					imap.end();
					resolve({ success: true, emails: fetchedEmails });
				});
			});
		});

		imap.once("error", (err) => {
			reject(new Error(`IMAP connection failed: ${err.message}`));
		});

		imap.once("end", () => {
			console.log("IMAP connection ended.");
		});

		imap.connect();
	});
}
