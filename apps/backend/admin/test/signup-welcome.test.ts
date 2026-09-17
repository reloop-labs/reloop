import { describe, expect, test } from "bun:test";
import {
	conversationAlreadyWelcomed,
	pickWelcomeSender,
	SIGNUP_WELCOME_SUPPORT_MESSAGE,
} from "@reloop/admin/services/support/signup-welcome";

describe("signup welcome support message", () => {
	test("uses the agreed founder copy", () => {
		expect(SIGNUP_WELCOME_SUPPORT_MESSAGE).toBe(
			"Hey, Pranav here. If you get stuck on domains, DNS, or sending, ping me in this thread. I read these.",
		);
	});

	test("sends when the thread has no welcome yet", () => {
		expect(conversationAlreadyWelcomed([])).toBe(false);
		expect(
			conversationAlreadyWelcomed([
				{ body: "I'm having trouble sending emails." },
			]),
		).toBe(false);
	});

	test("skips when the welcome is already in the thread", () => {
		expect(
			conversationAlreadyWelcomed([{ body: SIGNUP_WELCOME_SUPPORT_MESSAGE }]),
		).toBe(true);
		expect(
			conversationAlreadyWelcomed([
				{ body: `  ${SIGNUP_WELCOME_SUPPORT_MESSAGE}  ` },
			]),
		).toBe(true);
	});

	test("sends as the configured email when that user exists", () => {
		expect(
			pickWelcomeSender({
				configuredEmail: "pranav@reloop.sh",
				userForConfiguredEmail: { id: "user_pranav" },
				firstSuperAdmin: { id: "user_other_admin" },
			}),
		).toEqual({ id: "user_pranav" });
	});

	test("does not fall back to another admin when the configured email is missing", () => {
		expect(
			pickWelcomeSender({
				configuredEmail: "pranav@reloop.sh",
				userForConfiguredEmail: null,
				firstSuperAdmin: { id: "user_other_admin" },
			}),
		).toBeNull();
	});

	test("falls back to the first super-admin when no sender email is configured", () => {
		expect(
			pickWelcomeSender({
				configuredEmail: "",
				userForConfiguredEmail: null,
				firstSuperAdmin: { id: "user_admin" },
			}),
		).toEqual({ id: "user_admin" });
	});

	test("skips when no sender can be resolved", () => {
		expect(
			pickWelcomeSender({
				configuredEmail: "",
				userForConfiguredEmail: null,
				firstSuperAdmin: null,
			}),
		).toBeNull();
	});
});
