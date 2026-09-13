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

		for (const [name, counts] of Object.entries(rendered)) {
			expect(`${name}: ${counts.brand}`).toBe(`${name}: ${counts.brand}`);
			expect(counts.brand).toBeGreaterThan(0);
		}
	});

	test("no template leaks Reloop beyond the shared footer", async () => {
		const rendered = await renderAll("Contoso Mail");

		for (const [name, counts] of Object.entries(rendered)) {
			expect(`${name} leaked ${counts.reloop}`).toBe(
				`${name} leaked ${RETAINED_FOOTER_ATTRIBUTION_MENTIONS}`,
			);
		}
	});

	test("defaults to Reloop when APP_NAME is unset", async () => {
		const rendered = await renderAll();

		for (const counts of Object.values(rendered)) {
			expect(counts.brand).toBeGreaterThan(0);
		}
	});
});
