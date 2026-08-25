import { log as evlog } from "evlog";
import { inboxConfig } from "../inbox.config";

const TESTER_PLUS_TAG = /\+test-[a-f0-9]{6,}\b/i;
const TESTER_LOCAL_PART = /^test-[a-f0-9]{6,}$/i;
const TESTER_PLUS_IN_MIME = /\+test-[a-f0-9]{6,}@/i;

export function isDeliverabilityTesterRecipient(address: string): boolean {
	const localPart = (address.split("@")[0] || "").trim();
	if (!localPart) return false;
	return TESTER_PLUS_TAG.test(localPart) || TESTER_LOCAL_PART.test(localPart);
}

export function shouldForwardToDeliverabilityTester(
	rawMessage: string,
	recipients: string[],
): boolean {
	if (
		recipients.some((recipient) => isDeliverabilityTesterRecipient(recipient))
	) {
		return true;
	}
	const headerBlock = rawMessage.split(/\r?\n\r?\n/)[0] || rawMessage;
	return TESTER_PLUS_IN_MIME.test(headerBlock);
}

export async function forwardToDeliverabilityTester(
	rawMessage: string,
): Promise<void> {
	const base = inboxConfig.BASE_URL.replace(/\/$/, "");
	const url = `${base}/api/tools/v1/deliverability-test/inject`;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "ReloopInbox/1.0",
			},
			body: JSON.stringify({ rawMime: rawMessage }),
			signal: AbortSignal.timeout(15_000),
		});

		if (!response.ok) {
			const body = await response.text().catch(() => "");
			evlog.warn(
				"inbox",
				`[INBOX] Deliverability tester inject failed: ${response.status} ${body.slice(0, 300)}`,
			);
		}
	} catch (error) {
		evlog.warn(
			"inbox",
			`[INBOX] Deliverability tester inject skipped: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

export async function maybeForwardToDeliverabilityTester(
	rawMessage: string,
	recipients: string[],
): Promise<void> {
	if (!shouldForwardToDeliverabilityTester(rawMessage, recipients)) {
		return;
	}
	await forwardToDeliverabilityTester(rawMessage);
}
