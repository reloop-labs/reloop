import { describe, expect, it } from "vitest";
import { ensureAbsoluteUrl } from "./absolute-url";

describe("ensureAbsoluteUrl", () => {
	it("returns empty string for null, undefined, or whitespace", () => {
		expect(ensureAbsoluteUrl(null)).toBe("");
		expect(ensureAbsoluteUrl(undefined)).toBe("");
		expect(ensureAbsoluteUrl("")).toBe("");
		expect(ensureAbsoluteUrl("   ")).toBe("");
	});

	it("preserves data: and blob: URLs", () => {
		const dataUrl = "data:image/svg+xml;base64,PHN2Zy8+";
		const blobUrl = "blob:http://localhost:3000/abcd-1234";
		expect(ensureAbsoluteUrl(dataUrl)).toBe(dataUrl);
		expect(ensureAbsoluteUrl(blobUrl)).toBe(blobUrl);
	});

	it("preserves valid absolute http/https URLs", () => {
		const validS3 =
			"https://s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg";
		const validHttp =
			"http://s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg";
		expect(ensureAbsoluteUrl(validS3)).toBe(validS3);
		expect(ensureAbsoluteUrl(validHttp)).toBe(validHttp);
	});

	it("converts scheme-less S3 host URLs to absolute https URLs", () => {
		const schemeless =
			"s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg";
		expect(ensureAbsoluteUrl(schemeless)).toBe(
			"https://s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg",
		);
	});

	it("converts protocol-relative URLs to https", () => {
		const protocolRelative =
			"//s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg";
		expect(ensureAbsoluteUrl(protocolRelative)).toBe(
			"https://s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg",
		);
	});

	it("fixes URLs with leading slashes before an S3 domain host", () => {
		const leadingSlash =
			"/s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg";
		expect(ensureAbsoluteUrl(leadingSlash)).toBe(
			"https://s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg",
		);
	});

	it("fixes URLs where app origin was prepended in front of an S3 domain URL", () => {
		const prependedOrigin =
			"https://reloop.sh/s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg";
		expect(ensureAbsoluteUrl(prependedOrigin)).toBe(
			"https://s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg",
		);

		const localhostPrepended =
			"http://localhost:3000/s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg";
		expect(ensureAbsoluteUrl(localhostPrepended)).toBe(
			"https://s3.reloop.sh/reloop/uploads/2026/07/kkspseorvxubr8jzgmz6m27f.svg",
		);
	});

	it("preserves legitimate app-relative asset paths", () => {
		expect(ensureAbsoluteUrl("/web-app-manifest-512x512.png")).toBe(
			"/web-app-manifest-512x512.png",
		);
		expect(ensureAbsoluteUrl("/images/avatar.jpg")).toBe("/images/avatar.jpg");
	});
});
