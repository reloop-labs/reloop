import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Generate SSHA512 password hash using dovecot
export function generateSSHA512Password(password: string): string {
	try {
		const hash = execSync(`doveadm pw -s SSHA512 -p '${password}'`).toString().trim();
		return hash;
	} catch (error) {
		console.error("Error generating password hash:", error);
		throw new Error("Failed to generate password hash");
	}
}

// Get public IP address
export function getPublicIP(): string {
	try {
		return execSync("curl -s ifconfig.me").toString().trim();
	} catch (error) {
		console.error("Error getting public IP:", error);
		return "127.0.0.1"; // Fallback
	}
}

// Generate DKIM keys
export function generateDKIMKeys(domain: string, selector: string = "mail"): string {
	try {
		const keyPath = `/var/lib/rspamd/dkim/${domain}/${selector}.private`;
		const pubPath = `/var/lib/rspamd/dkim/${domain}/${selector}.pub`;

		execSync(`sudo mkdir -p /etc/rspamd/dkim && sudo chown -R _rspamd:_rspamd /etc/rspamd/dkim`);
		execSync(`sudo mkdir -p /var/lib/rspamd/dkim && sudo chown -R _rspamd:_rspamd /var/lib/rspamd/dkim`);

		execSync(`rspamadm dkim_keygen -d ${domain} -b 2048 -s ${selector} -k ${keyPath} | sudo tee ${pubPath}`);

		const pubKey = fs.readFileSync(pubPath, "utf8");
		const valuepubkey = pubKey.match(/p=[^"]+/g)?.join("").replace(/\s/g, "").replace(/;/g, ";") || "";

		return valuepubkey;
	} catch (error) {
		console.error("Error generating DKIM keys:", error);
		throw new Error("Failed to generate DKIM keys");
	}
}

// Generate DNS records
export function generateDNSRecords(domain: string, selector: string = "mail", valuepubkey: string) {
	const ip = getPublicIP();
	
	return {
		MX: `${domain}. IN MX 10 ${domain}.`,
		SPF: `${domain}. IN TXT "v=spf1 ip4:${ip} ~all"`,
		DKIM: `${selector}._domainkey.${domain}. IN TXT "v=DKIM1; k=rsa; ${valuepubkey}"`,
		DMARC: `_dmarc.${domain}. IN TXT "v=DMARC1; p=none; rua=mailto:postmaster@${domain}"`,
		IP: `${domain}. IN A ${ip}`,
	};
}

// Restart mail services
export function restartMailServices(): void {
	try {
		execSync("sudo systemctl restart postfix dovecot rspamd");
	} catch (error) {
		console.error("Error restarting mail services:", error);
		throw new Error("Failed to restart mail services");
	}
}

// Remove directory recursively
export function removeDirectory(dirPath: string): void {
	if (fs.existsSync(dirPath)) {
		fs.rmSync(dirPath, { recursive: true, force: true });
	}
}

// Remove file if exists
export function removeFile(filePath: string): void {
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
}
