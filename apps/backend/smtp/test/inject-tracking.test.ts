import { beforeAll, describe, expect, test } from "bun:test";
import {
	chmodSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { simpleParser } from "mailparser";
import { decodeTrackingToken } from "../../mail/src/lib/crypto";

const TRACKING_SECRET = "test_tracking_secret";
const TRACKING_BASE_URL = "https://link.reloop.test";
const PRICING_URL = "https://example.com/pricing?plan=pro&ref=news";
const QUOTED_URL = "https://example.com/single-quoted";
const DEEP_URL = `https://example.com/${"deep/".repeat(20)}page`;
const PLAIN_TEXT = "Bonjour été\r\nPricing: https://example.com/pricing\r\n";
const ATTACHMENT = Buffer.from(
	Array.from({ length: 769 }, (_, index) => index % 256),
);

const smtpDir = join(import.meta.dir, "..");
const kumoImage = readFileSync(join(smtpDir, "Dockerfile"), "utf8").match(
	/^FROM (\S+)/m,
)?.[1];

const crlf = (lines: string[]) => lines.join("\r\n");

const base64 = (content: string | Buffer) =>
	Buffer.from(content)
		.toString("base64")
		.replace(/.{76}(?=.)/g, "$&\r\n");

function quotedPrintable(content: string): string {
	const tokens = [...Buffer.from(content, "utf8")].map((byte) =>
		byte === 61 || byte < 32 || byte > 126
			? `=${byte.toString(16).toUpperCase().padStart(2, "0")}`
			: String.fromCharCode(byte),
	);
	const lines: string[] = [];
	let line = "";
	for (const token of tokens) {
		if (line.length + token.length > 75) {
			lines.push(`${line}=`);
			line = "";
		}
		line += token;
	}
	lines.push(line);
	return crlf(lines);
}

const headers = (subject: string) => [
	"From: app@sender.test",
	"To: user@rcpt.test",
	`Subject: ${subject}`,
	"MIME-Version: 1.0",
];

const trackedHtml = `<html><body><p>Café</p><a href="${PRICING_URL.replace("&", "&amp;")}">Pricing</a> <a href='${QUOTED_URL}'>Quoted</a></body></html>`;

const fixtures: Record<string, string> = {
	pythonBoundary: crlf([
		...headers("python boundary"),
		'Content-Type: multipart/mixed; boundary="===============111=="',
		"",
		"--===============111==",
		'Content-Type: multipart/alternative; boundary="===============222=="',
		"",
		"--===============222==",
		'Content-Type: text/plain; charset="utf-8"',
		"Content-Transfer-Encoding: base64",
		"",
		base64(PLAIN_TEXT),
		"",
		"--===============222==",
		'Content-Type: text/html; charset="utf-8"',
		"Content-Transfer-Encoding: base64",
		"",
		base64(trackedHtml),
		"",
		"--===============222==--",
		"",
		"--===============111==",
		'Content-Type: application/octet-stream; name="report.bin"',
		'Content-Disposition: attachment; filename="report.bin"',
		"Content-Transfer-Encoding: base64",
		"",
		base64(ATTACHMENT),
		"",
		"--===============111==--",
		"",
	]),
	quotedPrintable: crlf([
		...headers("quoted printable"),
		'Content-Type: multipart/alternative; boundary="===============333=="',
		"",
		"--===============333==",
		'Content-Type: text/plain; charset="utf-8"',
		"Content-Transfer-Encoding: 7bit",
		"",
		"plain part",
		"",
		"--===============333==",
		'Content-Type: text/html; charset="utf-8"',
		"Content-Transfer-Encoding: quoted-printable",
		"",
		quotedPrintable(
			`<html><body><p>${"Lorem ipsum dolor sit amet. ".repeat(4)}</p><a href="${DEEP_URL}">Deep</a></body></html>`,
		),
		"",
		"--===============333==--",
		"",
	]),
	htmlOnlyNoBody: crlf([
		...headers("html only"),
		'Content-Type: text/html; charset="utf-8"',
		"Content-Transfer-Encoding: 7bit",
		"",
		`<p><a href='${QUOTED_URL}'>Quoted</a></p>`,
		"",
	]),
	plainOnly: crlf([
		...headers("plain only"),
		'Content-Type: text/plain; charset="utf-8"',
		"",
		"This mentions text/html but is plain.",
		"--===============999==",
		"line ending in equals==",
		"",
	]),
};

let results: Record<string, string>;

function mimeSegments(raw: string, boundary: string): string[] {
	return raw.split(`--${boundary}`).slice(1, -1);
}

function hrefs(html: string): { quote: string; url: string }[] {
	return [...html.matchAll(/href=(["'])(.*?)\1/g)].map((match) => ({
		quote: match[1] ?? "",
		url: match[2] ?? "",
	}));
}

function clickDestination(trackedUrl: string): string | undefined {
	const token = trackedUrl.split("/redirect/")[1] ?? "";
	return decodeTrackingToken<{ id: string; url: string }>(
		token,
		TRACKING_SECRET,
	)?.url;
}

function openTokens(html: string): string[] {
	return [...html.matchAll(/\/api\/mail\/v1\/track\/open\/([\w-]+)/g)].map(
		(match) => match[1] ?? "",
	);
}

beforeAll(() => {
	expect(kumoImage).toBeDefined();

	const dir = mkdtempSync(join(tmpdir(), "inject-tracking-"));
	chmodSync(dir, 0o755);
	writeFileSync(join(dir, "fixtures.json"), JSON.stringify(fixtures));
	chmodSync(join(dir, "fixtures.json"), 0o644);

	try {
		const run = Bun.spawnSync([
			"docker",
			"run",
			"--rm",
			"-e",
			`TRACKING_SECRET=${TRACKING_SECRET}`,
			"-e",
			`TRACKING_BASE_URL=${TRACKING_BASE_URL}`,
			"-v",
			`${join(smtpDir, "policy")}:/opt/kumomta/etc/policy/policy:ro`,
			"-v",
			`${join(import.meta.dir, "inject-tracking.runner.lua")}:/opt/kumomta/etc/policy/runner.lua:ro`,
			"-v",
			`${dir}:/fixtures:ro`,
			"--entrypoint",
			"/opt/kumomta/sbin/kumod",
			kumoImage as string,
			"--policy",
			"/opt/kumomta/etc/policy/runner.lua",
			"--user",
			"kumod",
		]);
		const stdout = run.stdout.toString();
		const line = stdout
			.split("\n")
			.find((output) => output.startsWith("INJECT_TRACKING_RESULTS "));
		if (!line) {
			throw new Error(
				`KumoMTA runner produced no results (exit ${run.exitCode}):\n${stdout}\n${run.stderr.toString()}`,
			);
		}
		results = JSON.parse(line.slice("INJECT_TRACKING_RESULTS ".length));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}, 300_000);

describe("inject_tracking in KumoMTA", () => {
	test("fixtures exercise the cases that used to break", () => {
		expect(fixtures.pythonBoundary).toContain(
			"==\r\n\r\n--===============111==",
		);
		expect(fixtures.quotedPrintable).toContain("href=3D");
		expect(fixtures.quotedPrintable).not.toContain(DEEP_URL);
	});

	test("boundaries ending in = keep their structure", async () => {
		const input = fixtures.pythonBoundary as string;
		const output = results.pythonBoundary as string;

		expect(mimeSegments(output, "===============111==")).toHaveLength(2);
		expect(mimeSegments(output, "===============222==")).toHaveLength(2);

		const parsed = await simpleParser(output);
		expect(parsed.text?.replace(/\n/g, "\r\n")).toBe(PLAIN_TEXT);
		expect(parsed.attachments).toHaveLength(1);
		expect(parsed.attachments[0]?.filename).toBe("report.bin");
		expect(
			Buffer.compare(parsed.attachments[0]?.content as Buffer, ATTACHMENT),
		).toBe(0);

		expect(mimeSegments(output, "===============111==")[1]).toBe(
			mimeSegments(input, "===============111==")[1],
		);
		const inputPlain = mimeSegments(input, "===============222==")[0];
		const outputPlain = mimeSegments(output, "===============222==")[0];
		expect(outputPlain).toBe(inputPlain);
	});

	test("pixel stays inside the html part", async () => {
		const output = results.pythonBoundary as string;
		const closing = "--===============111==--";
		expect(
			output.slice(output.lastIndexOf(closing) + closing.length).trim(),
		).toBe("");

		const html = String((await simpleParser(output)).html);
		const tokens = openTokens(html);
		expect(tokens).toHaveLength(1);
		const open = decodeTrackingToken<{ id: string; url?: string }>(
			tokens[0] as string,
			TRACKING_SECRET,
		);
		expect(open?.id).toBe("log_test_1");
		expect(open?.url).toBeUndefined();
	});

	test("double and single quoted links decode to their destinations", async () => {
		const html = String(
			(await simpleParser(results.pythonBoundary as string)).html,
		);
		const links = hrefs(html);

		expect(links.map((link) => link.quote)).toEqual(['"', "'"]);
		for (const link of links) {
			expect(link.url.startsWith(`${TRACKING_BASE_URL}/redirect/`)).toBe(true);
		}
		expect(links.map((link) => clickDestination(link.url))).toEqual([
			PRICING_URL,
			QUOTED_URL,
		]);
		expect(html).toContain(">Quoted</a>");
	});

	test("quoted-printable links split by soft line breaks are tracked", async () => {
		const output = results.quotedPrintable as string;
		expect(mimeSegments(output, "===============333==")[0]).toBe(
			mimeSegments(
				fixtures.quotedPrintable as string,
				"===============333==",
			)[0],
		);

		const html = String((await simpleParser(output)).html);
		const links = hrefs(html);
		expect(links).toHaveLength(1);
		expect(clickDestination(links[0]?.url as string)).toBe(DEEP_URL);
		expect(openTokens(html)).toHaveLength(1);
	});

	test("html without a body tag is tracked", async () => {
		const html = String(
			(await simpleParser(results.htmlOnlyNoBody as string)).html,
		);
		const links = hrefs(html);
		expect(links.map((link) => link.quote)).toEqual(["'"]);
		expect(clickDestination(links[0]?.url as string)).toBe(QUOTED_URL);
		expect(openTokens(html)).toHaveLength(1);
	});

	test("messages without an html part pass through unchanged", () => {
		expect(results.plainOnly).toBe(fixtures.plainOnly as string);
	});
});
