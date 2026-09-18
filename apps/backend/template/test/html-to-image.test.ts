import { afterAll, describe, expect, test } from "bun:test";
import { parseHtmlToImageRequest } from "../src/utils/html-document";
import {
	closeHtmlToImageRenderer,
	isAllowedRenderUrl,
	renderHtmlToImage,
} from "../src/utils/html-to-image";

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const runChromium = process.env.HTML_TO_IMAGE_E2E === "1";

function isPng(bytes: Uint8Array): boolean {
	return PNG_MAGIC.every((value, index) => bytes[index] === value);
}

describe("renderHtmlToImage", () => {
	afterAll(async () => {
		await closeHtmlToImageRenderer();
	});

	test.skipIf(!runChromium)(
		"renders a fragment to a PNG",
		async () => {
			const request = parseHtmlToImageRequest({
				html: "<h1>Welcome</h1><p>Thanks for signing up.</p>",
				width: 600,
				format: "png",
			});

			const bytes = await renderHtmlToImage(request);
			expect(bytes.byteLength).toBeGreaterThan(100);
			expect(isPng(bytes)).toBe(true);
		},
		30_000,
	);
});

describe("isAllowedRenderUrl", () => {
	test("allows inline schemes and public hosts", async () => {
		expect(await isAllowedRenderUrl("data:image/png;base64,AAAA")).toBe(true);
		expect(await isAllowedRenderUrl("about:blank")).toBe(true);
		expect(await isAllowedRenderUrl("https://1.1.1.1/logo.png")).toBe(true);
	});

	test("blocks private, loopback, metadata and non-http targets", async () => {
		for (const url of [
			"http://169.254.169.254/latest/meta-data/",
			"http://10.0.0.5:8222/varz",
			"http://127.0.0.1:8000/metrics",
			"http://[::1]/",
			"file:///etc/passwd",
			"ftp://1.1.1.1/x",
		]) {
			expect(await isAllowedRenderUrl(url)).toBe(false);
		}
	});
});
