import { appendFileSync, readFileSync } from "node:fs";

type Configuration = {
	token: string;
	domain: string;
	adminEmail: string;
	sshKeys: number[];
	region: string;
	version: string;
	repository: string;
	ref: string;
};

type Droplet = {
	id: number;
	status: string;
	networks: { v4: { type: string; ip_address: string }[] };
};

export function configurationFromEnv(
	env: Record<string, string | undefined>,
): Configuration {
	const required = (name: string, pattern: RegExp): string => {
		const value = env[name]?.trim() ?? "";
		if (!pattern.test(value)) throw new Error(`Invalid or missing ${name}`);
		return value;
	};
	if (env.RELOOP_ACCEPT_SMTP_LIMIT !== "true") {
		throw new Error(
			"DigitalOcean blocks SMTP. Acknowledge the evaluation-only deployment first.",
		);
	}
	const domain = required(
		"RELOOP_DOMAIN",
		/^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/,
	);
	const sshKeys = required(
		"DIGITALOCEAN_SSH_KEY_IDS",
		/^[1-9]\d*(\s*,\s*[1-9]\d*)*$/,
	)
		.split(",")
		.map(Number);
	if (sshKeys.some((key) => !Number.isSafeInteger(key))) {
		throw new Error("Invalid DIGITALOCEAN_SSH_KEY_IDS");
	}
	return {
		token: required("DIGITALOCEAN_TOKEN", /^\S+$/),
		domain,
		adminEmail: required(
			"RELOOP_ADMIN_EMAIL",
			/^[A-Za-z0-9._%+-]+@([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/,
		),
		sshKeys,
		region: required("DIGITALOCEAN_REGION", /^[a-z]{3}\d$/),
		version: required("RELOOP_VERSION", /^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,127}$/),
		repository: required(
			"GITHUB_REPOSITORY",
			/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/,
		),
		ref: required("GITHUB_SHA", /^[a-f0-9]{40}$/),
	};
}

export function userData(configuration: Configuration): string {
	const values = {
		RELOOP_DOMAIN: configuration.domain,
		RELOOP_ADMIN_EMAIL: configuration.adminEmail,
		RELOOP_VERSION: configuration.version,
		RELOOP_INSTALL_REF: configuration.ref,
		RELOOP_INSTALL_BASE_URL: `https://raw.githubusercontent.com/${configuration.repository}/${configuration.ref}/install`,
	};
	const exports = Object.entries(values)
		.map(
			([name, value]) => `export ${name}='${value.replaceAll("'", "'\\''")}'`,
		)
		.join("\n");
	const script = readFileSync(
		new URL("./bootstrap.sh", import.meta.url),
		"utf8",
	).replaceAll("\r\n", "\n");
	return script.replace("set -Eeuo pipefail", `set -Eeuo pipefail\n${exports}`);
}

export async function provision(
	configuration: Configuration,
	send: typeof fetch = fetch,
	wait: (milliseconds: number) => Promise<void> = (milliseconds) =>
		Bun.sleep(milliseconds),
): Promise<{ id: number; ip: string }> {
	const request = async (path: string, body?: unknown) => {
		const response = await send(`https://api.digitalocean.com/v2/${path}`, {
			method: body ? "POST" : "GET",
			redirect: "error",
			headers: {
				Authorization: `Bearer ${configuration.token}`,
				"Content-Type": "application/json",
			},
			body: body ? JSON.stringify(body) : undefined,
			signal: AbortSignal.timeout(30_000),
		});
		if (!response.ok) {
			await response.body?.cancel();
			throw new Error(
				`DigitalOcean returned HTTP ${response.status}. Inspect the account before retrying; a Droplet may already exist.`,
			);
		}
		return response.json();
	};
	const existing = await request(
		`droplets?name=${encodeURIComponent(configuration.domain)}&per_page=1`,
	);
	if (!Array.isArray(existing.droplets))
		throw new Error("Invalid Droplet list response");
	if (existing.droplets.length > 0) {
		throw new Error(
			`A Droplet named ${configuration.domain} already exists. Manage it through SSH; this workflow creates new installations only.`,
		);
	}
	let created: { droplet: Droplet };
	try {
		created = await request("droplets", {
			name: configuration.domain,
			region: configuration.region,
			size: "s-4vcpu-8gb",
			image: "ubuntu-24-04-x64",
			ssh_keys: configuration.sshKeys,
			monitoring: true,
			user_data: userData(configuration),
		});
	} catch {
		throw new Error(
			"Droplet creation was not confirmed. Inspect DigitalOcean before retrying; the request may have created a billable Droplet.",
		);
	}
	const id = created.droplet?.id;
	if (!Number.isSafeInteger(id) || id <= 0)
		throw new Error(
			"Missing Droplet ID. Inspect DigitalOcean before retrying.",
		);
	console.log(
		`Created Droplet ${id}. Installation continues on the server. No automatic deletion will occur on failure.`,
	);
	for (let attempt = 0; attempt < 60; attempt += 1) {
		const { droplet }: { droplet: Droplet } = await request(`droplets/${id}`);
		const ip = droplet.networks.v4.find(
			(network) => network.type === "public",
		)?.ip_address;
		if (droplet.status === "active" && ip) return { id, ip };
		await wait(5000);
	}
	throw new Error(
		`Droplet ${id} is still provisioning. Inspect DigitalOcean and the server logs; do not rerun creation.`,
	);
}

if (import.meta.main) {
	try {
		const configuration = configurationFromEnv(process.env);
		const { id, ip } = await provision(configuration);
		const summary = `## DigitalOcean Droplet provisioned

Droplet ${id}: ${ip}

Reloop installation is still running through cloud-init. This workflow does not verify application health or mail delivery.

Add DNS A records for ${configuration.domain}, link.${configuration.domain}, and inbound.${configuration.domain} pointing to ${ip}.

Connect with \`ssh root@${ip}\`, then run:

\`\`\`bash
cloud-init status --wait
cat /var/lib/reloop-install.status
tail -n 50 /var/log/reloop-install.log
reloop status
cat /opt/reloop/admin-setup.key
\`\`\`

After installation and DNS propagation, open https://${configuration.domain}/dashboard/setup and use the setup key. Keep the key and install log private.

DigitalOcean blocks SMTP ports 25, 465, and 587. This installation is for evaluation and cannot deliver production mail directly. The Droplet incurs charges until you destroy it in DigitalOcean.
`;
		console.log(summary);
		if (process.env.GITHUB_STEP_SUMMARY) {
			appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
		}
	} catch (error) {
		console.error(error instanceof Error ? error.message : "Deployment failed");
		process.exitCode = 1;
	}
}
