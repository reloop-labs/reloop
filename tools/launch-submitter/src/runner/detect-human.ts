import type { Page } from "playwright";

const CAPTCHA_SELECTORS = [
	'iframe[src*="recaptcha"]',
	'iframe[src*="hcaptcha"]',
	'iframe[src*="turnstile"]',
	'iframe[title*="reCAPTCHA" i]',
	".g-recaptcha",
	"#captcha",
	"[data-captcha]",
	'text=/verify you are human/i',
	'text=/i.?m not a robot/i',
	'text=/complete the security check/i',
	'text=/attention required/i',
	'text=/two-factor/i',
	'text=/enter the code/i',
	'text=/confirm it.?s you/i',
];

const PAYWALL_PATTERNS = [/upgrade to submit/i, /payment required/i, /subscribe to submit/i, /pricing to list/i];

export async function detectHumanGate(page: Page): Promise<{ kind: "captcha" | "paywall" | "login"; detail: string } | null> {
	for (const selector of CAPTCHA_SELECTORS) {
		try {
			const el = page.locator(selector).first();
			if (await el.isVisible({ timeout: 300 }).catch(() => false)) {
				return { kind: "captcha", detail: `Matched: ${selector}` };
			}
		} catch {
			// continue
		}
	}

	const text = ((await page.locator("body").innerText().catch(() => "")) || "").slice(0, 4000);
	for (const pattern of PAYWALL_PATTERNS) {
		if (pattern.test(text)) {
			return { kind: "paywall", detail: pattern.toString() };
		}
	}

	const loginHints = [/sign in to continue/i, /log in to submit/i, /create an account to/i];
	for (const pattern of loginHints) {
		if (pattern.test(text)) {
			const signedIn = await page
				.locator('[aria-label*="account" i], [data-testid*="avatar" i], img[alt*="avatar" i]')
				.first()
				.isVisible()
				.catch(() => false);
			if (!signedIn) {
				return { kind: "login", detail: pattern.toString() };
			}
		}
	}

	return null;
}
