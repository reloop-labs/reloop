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
import { htmlToText } from "@reloop/db/html-to-text";
import { simpleParser } from "mailparser";

const TRACKING_SECRET = "test_tracking_secret";
const TRACKING_BASE_URL = "https://link.reloop.test";
const PRICING_URL = "https://example.com/pricing";
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

const headers = (subject: string) => [
	"From: app@sender.test",
	"To: user@rcpt.test",
	`Subject: ${subject}`,
	"X-Custom: keep-me",
	"MIME-Version: 1.0",
];

const html = `<html><body><p>Bonjour Café</p><p>See <a href="${PRICING_URL}">pricing</a></p></body></html>`;

const raws: Record<string, string> = {
	htmlOnly: crlf([
		...headers("html only"),
		'Content-Type: text/html; charset="utf-8"',
		"Content-Transfer-Encoding: base64",
		"",
		base64(html),
		"",
	]),
	htmlWithAttachment: crlf([
		...headers("html with attachment"),
		'Content-Type: multipart/mixed; boundary="MIX"',
		"",
		"--MIX",
		'Content-Type: text/html; charset="utf-8"',
		"",
		html,
		"--MIX",
		'Content-Type: application/octet-stream; name="report.bin"',
		'Content-Disposition: attachment; filename="report.bin"',
		"Content-Transfer-Encoding: base64",
		"",
		base64(ATTACHMENT),
		"--MIX--",
		"",
	]),
	alreadyAlternative: crlf([
		...headers("already alternative"),
		'Content-Type: multipart/alternative; boundary="ALT"',
		"",
		"--ALT",
		'Content-Type: text/plain; charset="utf-8"',
		"",
		"Hand-written text",
		"--ALT",
		'Content-Type: text/html; charset="utf-8"',
		"",
		html,
		"--ALT--",
		"",
	]),
	related: crlf([
		...headers("related"),
		'Content-Type: multipart/related; boundary="REL"',
		"",
		"--REL",
		'Content-Type: text/html; charset="utf-8"',
		"",
		'<p>Logo <img src="cid:logo"></p>',
		"--REL",
		"Content-Type: image/png",
		"Content-ID: <logo>",
		"Content-Transfer-Encoding: base64",
		"",
		base64(ATTACHMENT),
		"--REL--",
		"",
	]),
	plainOnly: crlf([
		...headers("plain only"),
		'Content-Type: text/plain; charset="utf-8"',
		"",
		"Just text that mentions text/html.",
		"",
	]),
};

type Result = { needs: boolean; raw: string };
let results: Record<string, Result>;

beforeAll(async () => {
	expect(kumoImage).toBeDefined();

	// What log-incoming does: convert the parsed HTML with the shared converter.
	const fixtures: Record<string, { raw: string; text: string }> = {};
	for (const [name, raw] of Object.entries(raws)) {
		const parsed = await simpleParser(raw);
		fixtures[name] = {
			raw,
			text: parsed.html ? htmlToText(parsed.html) : "",
		};
	}

	const dir = mkdtempSync(join(tmpdir(), "plain-text-"));
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
			`${join(import.meta.dir, "plain-text.runner.lua")}:/opt/kumomta/etc/policy/runner.lua:ro`,
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
			.find((output) => output.startsWith("PLAIN_TEXT_RESULTS "));
		if (!line) {
			throw new Error(
				`KumoMTA runner produced no results (exit ${run.exitCode}):\n${stdout}\n${run.stderr.toString()}`,
			);
		}
		results = JSON.parse(line.slice("PLAIN_TEXT_RESULTS ".length));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}, 300_000);

const expectedText = htmlToText(html);

describe("plain-text alternative for SMTP submissions", () => {
	test("html-only message becomes multipart/alternative with text first", async () => {
		const result = results.htmlOnly as Result;
		expect(result.needs).toBe(true);

		const parsed = await simpleParser(result.raw);
		expect(parsed.headers.get("content-type")).toMatchObject({
			value: "multipart/alternative",
		});
		expect(result.raw.indexOf("text/plain")).toBeLessThan(
			result.raw.indexOf("text/html"),
		);
		// A real text part with real links, not mailparser's fallback from the
		// tracked HTML (which would contain /redirect/ URLs).
		expect(parsed.text?.trim()).toBe(expectedText);
		expect(parsed.text).toContain(PRICING_URL);
		expect(parsed.text).not.toContain("/redirect/");
		expect(parsed.text).toContain("Café");
	});

	test("html part is still tracked and other headers survive", async () => {
		const parsed = await simpleParser((results.htmlOnly as Result).raw);
		expect(parsed.html).toContain(`${TRACKING_BASE_URL}/redirect/`);
		expect(parsed.html).toContain("/api/mail/v1/track/open/");
		expect(parsed.html).toContain("Bonjour Café");
		expect(parsed.headers.get("x-custom")).toBe("keep-me");
		expect(parsed.subject).toBe("html only");
	});

	test("html inside multipart/mixed gains text and keeps the attachment", async () => {
		const result = results.htmlWithAttachment as Result;
		expect(result.needs).toBe(true);

		const parsed = await simpleParser(result.raw);
		expect(parsed.text?.trim()).toBe(expectedText);
		expect(parsed.html).toContain("/redirect/");
		expect(parsed.attachments).toHaveLength(1);
		expect(parsed.attachments[0]?.filename).toBe("report.bin");
		expect(Buffer.compare(parsed.attachments[0]?.content, ATTACHMENT)).toBe(0);
	});

	test("messages with their own text part are left alone", async () => {
		const result = results.alreadyAlternative as Result;
		expect(result.needs).toBe(false);
		const parsed = await simpleParser(result.raw);
		expect(parsed.text?.trim()).toBe("Hand-written text");
	});

	test("multipart/related and plain-only messages are skipped", () => {
		expect((results.related as Result).needs).toBe(false);
		expect((results.related as Result).raw).not.toContain("text/plain");
		expect((results.plainOnly as Result).needs).toBe(false);
	});
});
