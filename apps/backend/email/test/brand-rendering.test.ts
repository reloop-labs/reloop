import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const PROBE = join(import.meta.dir, "render-probe.ts");

const RETAINED_FOOTER_ATTRIBUTION_MENTIONS = 2;

function buildEnv(appName?: string): Record<string, string> {
	const env = { ...process.env } as Record<string, string>;
	if (appName) {
		env.APP_NAME = appName;
	} else {
		delete env.APP_NAME;
	}
	return env;
}

async function renderAll(appName?: string) {
	const proc = Bun.spawn(["bun", "run", PROBE], {
		cwd: join(import.meta.dir, ".."),
		env: buildEnv(appName),
		stdout: "pipe",
		stderr: "pipe",
	});

	const [stdout, stderr, code] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);

	const line = stdout.trim().split("\n").at(-1) ?? "";
	if (code !== 0 || !line.startsWith("{")) {
		throw new Error(`render probe failed (exit ${code}): ${stderr || stdout}`);
	}
	return JSON.parse(line) as Record<
		string,
		{ brand: number; attributed: number; selfHosted: string }
	>;
}

async function renderFooters(appName?: string) {
	const rendered = await renderAll(appName);
	return Object.fromEntries(
		Object.entries(rendered).map(([name, counts]) => [name, counts.selfHosted]),
	);
}

describe("system email branding", () => {
	test("every template renders the configured app name", async () => {
		const rendered = await renderAll("Contoso Mail");

		expect(
			Object.entries(rendered)
				.filter(([, counts]) => counts.brand < 1)
				.map(([name]) => name),
		).toEqual([]);
	});

	test("the configured name never appears without Reloop attribution", async () => {
		const rendered = await renderAll("Contoso Mail");

		expect(
			Object.entries(rendered)
				.filter(([, counts]) => counts.attributed !== counts.brand)
				.map(
					([name, counts]) => `${name}: ${counts.attributed}/${counts.brand}`,
				),
		).toEqual([]);
	});

	test("a rebranded install is footed as self-hosted Reloop", async () => {
		const footers = await renderFooters("Contoso Mail");

		expect(
			Object.entries(footers)
				.filter(([, footer]) => footer !== "Self-hosted Reloop × Contoso Mail")
				.map(([name, footer]) => `${name}: ${footer}`),
		).toEqual([]);
	});

	test("Reloop Cloud carries no self-hosted line", async () => {
		const footers = await renderFooters();

		expect(
			Object.entries(footers)
				.filter(([, footer]) => footer !== "")
				.map(([name, footer]) => `${name}: ${footer}`),
		).toEqual([]);
	});

	test("defaults to Reloop in template copy, not just the footer", async () => {
		const rendered = await renderAll();

		expect(
			Object.entries(rendered)
				.filter(
					([, counts]) => counts.brand <= RETAINED_FOOTER_ATTRIBUTION_MENTIONS,
				)
				.map(([name, counts]) => `${name}: ${counts.brand}`),
		).toEqual([]);
	});
});
