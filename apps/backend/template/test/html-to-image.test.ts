import { afterAll, describe, expect, test } from "bun:test";
import { parseHtmlToImageRequest } from "../src/utils/html-document";
import {
	closeHtmlToImageRenderer,
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
