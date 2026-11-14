import { describe, expect, test } from "bun:test";
import { configurationFromEnv, provision, userData } from "./deploy";

const environment = {
	DIGITALOCEAN_TOKEN: "private-provider-token",
	DIGITALOCEAN_SSH_KEY_IDS: "12345, 67890",
	DIGITALOCEAN_REGION: "fra1",
	RELOOP_DOMAIN: "reloop.example.com",
	RELOOP_ADMIN_EMAIL: "admin@example.com",
	RELOOP_VERSION: "latest",
	RELOOP_ACCEPT_SMTP_LIMIT: "true",
	GITHUB_REPOSITORY: "reloop-labs/reloop",
	GITHUB_SHA: "a".repeat(40),
};
const configuration = configurationFromEnv(environment);
const activeDroplet = {
	id: 123,
	status: "active",
	networks: {
		v4: [
			{ type: "private", ip_address: "10.0.0.2" },
			{ type: "public", ip_address: "203.0.113.10" },
		],
	},
};

function transport(responses: (unknown | Error | Response)[]) {
	const requests: Request[] = [];
	const send = (async (input: string | URL | Request, init?: RequestInit) => {
		requests.push(new Request(input, init));
		const response = responses.shift();
		if (response instanceof Error) throw response;
		if (response === undefined) throw new Error("Unexpected API request");
		return response instanceof Response ? response : Response.json(response);
	}) as typeof fetch;
	return { requests, send };
}

describe("configuration", () => {
	test("requires credentials, SSH keys, valid inputs, and SMTP acknowledgement", () => {
		for (const name of Object.keys(environment)) {
			expect(() =>
				configurationFromEnv({ ...environment, [name]: "" }),
			).toThrow();
		}
		for (const [name, value] of [
			["RELOOP_DOMAIN", "example.com'; touch /tmp/injected; '"],
			["RELOOP_ADMIN_EMAIL", "admin@example.com\nexport BAD=1"],
			["RELOOP_VERSION", "$(id)"],
			["DIGITALOCEAN_SSH_KEY_IDS", "1,not-a-key"],
			["DIGITALOCEAN_SSH_KEY_IDS", "99999999999999999999999"],
			["GITHUB_SHA", "main"],
			["GITHUB_REPOSITORY", "https://example.com/repo"],
			["RELOOP_ACCEPT_SMTP_LIMIT", "false"],
		]) {
			expect(() =>
				configurationFromEnv({ ...environment, [name]: value }),
			).toThrow();
		}
		expect(configuration.sshKeys).toEqual([12345, 67890]);
	});

	test("bootstraps the existing installer at the selected commit without cloud credentials", () => {
		const script = userData(configuration);
		expect(script.startsWith("#!/usr/bin/env bash\n")).toBe(true);
		expect(script).not.toContain("\r");
		expect(script).not.toContain(environment.DIGITALOCEAN_TOKEN);
		expect(script).toContain(
			`https://raw.githubusercontent.com/reloop-labs/reloop/${environment.GITHUB_SHA}/install`,
		);
		expect(script).toContain("RELOOP_NONINTERACTIVE=1");
		expect(script).toContain("RELOOP_EXISTING=continue");
		expect(script).toContain("exec >/var/log/reloop-install.log 2>&1");
		expect(script).toContain("umask 077");
		expect(script).toContain("bash /root/reloop-install.sh");
		expect(script.indexOf("printf 'installed")).toBeGreaterThan(
			script.indexOf("bash /root/reloop-install.sh"),
		);
	});
});

test("creates one Ubuntu x64 Droplet and waits for its public IPv4", async () => {
	const { requests, send } = transport([
		{ droplets: [] },
		{ droplet: { id: 123 } },
		{ droplet: { id: 123, status: "new", networks: { v4: [] } } },
		{ droplet: activeDroplet },
	]);
	const waits: number[] = [];
	const result = await provision(configuration, send, async (ms) => {
		waits.push(ms);
	});
	expect(result).toEqual({ id: 123, ip: "203.0.113.10" });
	expect(waits).toEqual([5000]);
	expect(requests[0].url).toBe(
		"https://api.digitalocean.com/v2/droplets?name=reloop.example.com&per_page=1",
	);
	expect(requests.map((request) => request.method)).toEqual([
		"GET",
		"POST",
		"GET",
		"GET",
	]);
	const body = await requests[1].json();
	expect(body).toMatchObject({
		name: configuration.domain,
		image: "ubuntu-24-04-x64",
		size: "s-4vcpu-8gb",
		region: "fra1",
		ssh_keys: [12345, 67890],
	});
	expect(body.user_data).toBe(userData(configuration));
	for (const request of requests) {
		expect(request.headers.get("Authorization")).toBe(
			`Bearer ${environment.DIGITALOCEAN_TOKEN}`,
		);
		expect(request.redirect).toBe("error");
	}
});

test("refuses to replace or duplicate an existing named Droplet", async () => {
	const { requests, send } = transport([{ droplets: [activeDroplet] }]);
	await expect(provision(configuration, send)).rejects.toThrow(
		"already exists",
	);
	expect(requests.map((request) => request.method)).toEqual(["GET"]);
});

test("failed preflight requests never create infrastructure or expose provider responses", async () => {
	const { requests, send } = transport([
		new Response(environment.DIGITALOCEAN_TOKEN, { status: 401 }),
	]);
	await expect(provision(configuration, send)).rejects.toThrow("HTTP 401");
	expect(requests.length).toBe(1);
});

test("invalid list responses cannot bypass the duplicate check", async () => {
	const { requests, send } = transport([{}]);
	await expect(provision(configuration, send)).rejects.toThrow(
		"Invalid Droplet list",
	);
	expect(requests.length).toBe(1);
});

test("ambiguous create failures are not retried or deleted automatically", async () => {
	for (const failure of [
		new Error("network failure"),
		new Response("provider failed", { status: 500 }),
	]) {
		const { requests, send } = transport([{ droplets: [] }, failure]);
		await expect(provision(configuration, send)).rejects.toThrow(
			"Inspect DigitalOcean before retrying",
		);
		expect(requests.map((request) => request.method)).toEqual(["GET", "POST"]);
	}
});

test("missing create IDs stop without another creation attempt", async () => {
	const { requests, send } = transport([{ droplets: [] }, { droplet: {} }]);
	await expect(provision(configuration, send)).rejects.toThrow(
		"Missing Droplet ID",
	);
	expect(requests.length).toBe(2);
});

test("polling is bounded and never removes a server on timeout", async () => {
	const { requests, send } = transport([
		{ droplets: [] },
		{ droplet: { id: 123 } },
		...Array.from({ length: 60 }, () => ({
			droplet: { ...activeDroplet, status: "new" },
		})),
	]);
	await expect(provision(configuration, send, async () => {})).rejects.toThrow(
		"still provisioning",
	);
	expect(requests.length).toBe(62);
	expect(requests.filter((request) => request.method === "POST").length).toBe(
		1,
	);
	expect(requests.some((request) => request.method === "DELETE")).toBe(false);
});
