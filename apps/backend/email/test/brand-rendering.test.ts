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
	return JSON.parse(line) as Record<string, { brand: number; reloop: number }>;
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

	test("no template leaks Reloop beyond the shared footer", async () => {
		const rendered = await renderAll("Contoso Mail");

		expect(
			Object.entries(rendered)
				.filter(
					([, counts]) =>
						counts.reloop !== RETAINED_FOOTER_ATTRIBUTION_MENTIONS,
				)
				.map(([name, counts]) => `${name}: ${counts.reloop}`),
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
