import { existsSync } from "node:fs";
import { TemplateErrors } from "@be/template/error/template.error";
import { templateConfig } from "@be/template/template.config";
import { requestPinned, resolvePublicTarget } from "@reloop/webhook-delivery";
import { log } from "evlog";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright";
import { type HtmlToImageRequest, wrapEmailHtml } from "./html-document";

const { htmlToImage: limits } = templateConfig.constants;

function resolveChromiumPath(): string | undefined {
	if (templateConfig.CHROMIUM_PATH) return templateConfig.CHROMIUM_PATH;
	if (existsSync("/usr/bin/chromium-browser"))
		return "/usr/bin/chromium-browser";
	if (existsSync("/usr/bin/chromium")) return "/usr/bin/chromium";
	return undefined;
}

async function waitForImages(page: Page, timeoutMs: number): Promise<void> {
	await page
		.waitForFunction(
			() =>
				[...document.images].every(
					(img) => img.complete && img.naturalWidth > 0,
				),
			{ timeout: timeoutMs },
		)
		.catch(() => {
			// Incomplete images still screenshot; don't fail the render.
		});
}

function launchArgs(): string[] {
	return [
		"--disable-dev-shm-usage",
		"--disable-gpu",
		"--font-render-hinting=none",
		"--hide-scrollbars",
		"--no-first-run",
		// Required when Chromium runs as root in Docker.
		"--no-sandbox",
		"--disable-setuid-sandbox",
	];
}

const INLINE_SCHEMES = new Set(["data:", "about:", "blob:"]);

export async function isAllowedRenderUrl(url: string): Promise<boolean> {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return false;
	}
	if (INLINE_SCHEMES.has(parsed.protocol)) return true;
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
	try {
		await resolvePublicTarget(parsed.hostname);
		return true;
	} catch {
		return false;
	}
}

const MAX_SUBRESOURCE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;

async function fetchSubresource(url: string, accept: string) {
	let current = url;
	for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
		const response = await requestPinned({
			url: current,
			method: "GET",
			allowHttp: true,
			timeoutMs: limits.timeoutMs,
			maxBytes: MAX_SUBRESOURCE_BYTES,
			headers: { accept },
		});
		const location = response.headers.location;
		if (response.status < 300 || response.status >= 400 || !location) {
			return response;
		}
		current = new URL(location, current).toString();
	}
	throw new Error("Too many redirects");
}

async function fulfillThroughPinnedClient(
	route: Parameters<Parameters<BrowserContext["route"]>[1]>[0],
): Promise<void> {
	const request = route.request();
	const url = request.url();
	if (!(await isAllowedRenderUrl(url)) || request.method() !== "GET") {
		await route.abort("blockedbyclient");
		return;
	}
	if (INLINE_SCHEMES.has(new URL(url).protocol)) {
		await route.continue();
		return;
	}
	try {
		const response = await fetchSubresource(
			url,
			request.headers().accept ?? "*/*",
		);
		const contentType = response.headers["content-type"];
		await route.fulfill({
			status: response.status,
			headers: contentType ? { "content-type": contentType } : {},
			body: response.bodyBuffer,
		});
	} catch {
		await route.abort("blockedbyclient");
	}
}

async function blockPrivateRequests(context: BrowserContext): Promise<void> {
	await context.route("**/*", fulfillThroughPinnedClient);
}

let browserPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
	const executablePath = resolveChromiumPath();
	log.info({
		message: "Launching Chromium for HTML-to-image",
		executablePath: executablePath ?? "playwright-bundled",
	});

	try {
		return await chromium.launch({
			headless: true,
			executablePath,
			args: launchArgs(),
		});
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw TemplateErrors.htmlToImageFailed(
			`Could not launch Chromium: ${reason}. Install Chromium (or set CHROMIUM_PATH) and retry.`,
		);
	}
}

async function getBrowser(): Promise<Browser> {
	if (!browserPromise) {
		browserPromise = launchBrowser().catch((error) => {
			browserPromise = null;
			throw error;
		});
	}

	const browser = await browserPromise;
	if (!browser.isConnected()) {
		browserPromise = null;
		return getBrowser();
	}
	return browser;
}

/** Warm the browser so the first API request is not a cold Chromium launch. */
export async function warmHtmlToImageRenderer(): Promise<void> {
	try {
		await getBrowser();
	} catch (error) {
		log.warn({
			message:
				"HTML-to-image Chromium is not ready; it will retry on first request",
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

export async function closeHtmlToImageRenderer(): Promise<void> {
	if (!browserPromise) return;
	try {
		const browser = await browserPromise;
		await browser.close();
	} catch {
		// Already gone.
	} finally {
		browserPromise = null;
	}
}

export async function renderHtmlToImage(
	request: HtmlToImageRequest,
): Promise<Uint8Array> {
	const document = wrapEmailHtml(request.html, request.width);
	const browser = await getBrowser();
	const context = await browser.newContext({
		viewport: { width: request.width, height: 800 },
		deviceScaleFactor: request.scale,
		colorScheme: "light",
	});

	try {
		await blockPrivateRequests(context);
		const page = await context.newPage();
		page.setDefaultTimeout(limits.timeoutMs);
		await page.setContent(document, {
			waitUntil: "load",
			timeout: limits.timeoutMs,
		});
		await waitForImages(page, limits.timeoutMs);

		const contentHeight = await page.evaluate(() => {
			const el = document.documentElement;
			return Math.max(el.scrollHeight, el.offsetHeight, 1);
		});
		await page.setViewportSize({
			width: request.width,
			height: Math.min(Math.ceil(contentHeight), 8000),
		});

		const buffer = await page.screenshot({
			type: request.format,
			fullPage: true,
			omitBackground: false,
			...(request.format === "png" ? {} : { quality: request.quality }),
		});

		return new Uint8Array(buffer);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		log.error({
			message: "HTML-to-image render failed",
			error: reason,
		});
		throw TemplateErrors.htmlToImageFailed(reason);
	} finally {
		await context.close();
	}
}
