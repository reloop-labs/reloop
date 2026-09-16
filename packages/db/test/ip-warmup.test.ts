import { describe, expect, test } from "bun:test";
import {
	applyWarmupReservation,
	assertCanAssignDedicatedIp,
	DEFAULT_WARMUP_SCHEDULE,
	dailyCapForDay,
	emptyProviderCounts,
	providerCapForDay,
	resolveEgressDecision,
	splitProviderCaps,
	totalSentToday,
	type WarmupSnapshot,
	warmupDayNumber,
	warmupProgressView,
} from "../src/ip-warmup";
import { classifyMailboxProvider } from "../src/mailbox-provider";
import { utcDayStart } from "../src/reserve-send-credits";
import { MAILBOX_PROVIDERS } from "../src/schema/sending-ip";
import { parseSendingHostname, parseSendingIpAddress } from "../src/sending-ip";

function warmup(overrides: Partial<WarmupSnapshot> = {}): WarmupSnapshot {
	const now = new Date("2026-09-16T10:00:00.000Z");
	return {
		status: "active",
		overflow: "shared",
		schedule: DEFAULT_WARMUP_SCHEDULE,
		startedAt: now,
		completedAt: null,
		pausedAt: null,
		sentTodayByProvider: emptyProviderCounts(),
		dailyWindowStart: utcDayStart(now),
		...overrides,
	};
}

describe("parseSendingIpAddress", () => {
	test("accepts IPv4 and IPv6 and rejects junk", () => {
		expect(parseSendingIpAddress(" 203.0.113.10 ")).toEqual({
			address: "203.0.113.10",
			family: 4,
		});
		expect(parseSendingIpAddress("2001:DB8::1")?.address).toBe("2001:db8::1");
		expect(parseSendingIpAddress("not-an-ip")).toBeNull();
		expect(parseSendingIpAddress("203.0.113")).toBeNull();
	});
});

describe("parseSendingHostname", () => {
	test("normalizes a mail hostname and rejects spaces", () => {
		expect(parseSendingHostname(" MTA1.reloop.sh ")).toBe("mta1.reloop.sh");
		expect(parseSendingHostname("bad host")).toBeNull();
		expect(parseSendingHostname("")).toBeNull();
	});
});

describe("classifyMailboxProvider", () => {
	test("maps consumer domains onto the provider that scores the IP", () => {
		expect(classifyMailboxProvider("user@gmail.com")).toBe("gmail");
		expect(classifyMailboxProvider("USER@GoogleMail.com")).toBe("gmail");
		expect(classifyMailboxProvider("ada@outlook.com")).toBe("microsoft");
		expect(classifyMailboxProvider("ada@hotmail.co.uk")).toBe("microsoft");
		expect(classifyMailboxProvider("ada@yahoo.com")).toBe("yahoo");
		expect(classifyMailboxProvider("ada@aol.com")).toBe("yahoo");
		expect(classifyMailboxProvider("ada@icloud.com")).toBe("apple");
		expect(classifyMailboxProvider("ada@privaterelay.appleid.com")).toBe(
			"apple",
		);
		expect(classifyMailboxProvider("ada@acme.com")).toBe("other");
	});
});

describe("warmup schedule", () => {
	const start = new Date("2026-09-01T08:00:00.000Z");

	test("day 1 is the UTC day the warmup started", () => {
		expect(warmupDayNumber(start, new Date("2026-09-01T23:00:00.000Z"))).toBe(
			1,
		);
		expect(warmupDayNumber(start, new Date("2026-09-02T00:00:00.000Z"))).toBe(
			2,
		);
		expect(warmupDayNumber(start, new Date("2026-10-12T12:00:00.000Z"))).toBe(
			42,
		);
		expect(warmupDayNumber(start, new Date("2026-10-13T12:00:00.000Z"))).toBe(
			43,
		);
	});

	test("splits each day's global total across mailbox providers", () => {
		expect(dailyCapForDay(DEFAULT_WARMUP_SCHEDULE, 1)).toBe(200);
		expect(splitProviderCaps(200)).toEqual({
			gmail: 80,
			microsoft: 60,
			yahoo: 30,
			apple: 16,
			other: 14,
		});
		expect(providerCapForDay(DEFAULT_WARMUP_SCHEDULE, 1, "gmail")).toBe(80);
		expect(providerCapForDay(DEFAULT_WARMUP_SCHEDULE, 1, "microsoft")).toBe(60);
		expect(providerCapForDay(DEFAULT_WARMUP_SCHEDULE, 8, "gmail")).toBe(200);
		expect(providerCapForDay(DEFAULT_WARMUP_SCHEDULE, 43, "gmail")).toBeNull();

		const progress = warmupProgressView(
			warmup(),
			new Date("2026-09-16T10:00:00.000Z"),
		);
		expect(
			progress.providers.find((p) => p.provider === "gmail")?.dailyCap,
		).toBe(80);
		expect(
			progress.providers.find((p) => p.provider === "microsoft")?.dailyCap,
		).toBe(60);

		for (const total of [200, 500, 1000, 2500, 5000, 10000]) {
			const caps = splitProviderCaps(total);
			expect(totalSentToday(caps)).toBe(total);
			for (const provider of MAILBOX_PROVIDERS) {
				expect(caps[provider]).toBeGreaterThan(0);
			}
		}
	});
});

describe("applyWarmupReservation", () => {
	const now = new Date("2026-09-16T10:00:00.000Z");

	test("week 1 Gmail accepts 80 and overflows the 81st even if Microsoft is empty", () => {
		let state = warmup();
		let gmailAccepted = 0;
		let gmailOverflowed = 0;

		for (let i = 0; i < 100; i++) {
			const decision = applyWarmupReservation({
				warmup: state,
				provider: "gmail",
				recipientCount: 1,
				now,
			});
			if (decision.ok) {
				state = decision.next;
				gmailAccepted += 1;
			} else if (decision.reason === "overflow") {
				gmailOverflowed += 1;
				expect(decision.pool).toBe("shared");
			}
		}

		expect(gmailAccepted).toBe(80);
		expect(gmailOverflowed).toBe(20);
		expect(state.sentTodayByProvider.gmail).toBe(80);
		expect(state.sentTodayByProvider.microsoft).toBe(0);

		const microsoft = applyWarmupReservation({
			warmup: state,
			provider: "microsoft",
			recipientCount: 1,
			now,
		});
		expect(microsoft.ok).toBe(true);
		if (!microsoft.ok) return;
		expect(microsoft.sentToday).toBe(1);
		expect(microsoft.next.sentTodayByProvider.gmail).toBe(80);
	});

	test("defer overflow is per provider, not global", () => {
		const decision = applyWarmupReservation({
			warmup: warmup({
				overflow: "defer",
				sentTodayByProvider: { ...emptyProviderCounts(), gmail: 80 },
			}),
			provider: "gmail",
			recipientCount: 1,
			now,
		});
		expect(decision.ok).toBe(false);
		if (decision.ok) return;
		expect(decision.reason).toBe("overflow");
		expect(decision.pool).toBe("defer");
		expect(decision.provider).toBe("gmail");
	});

	test("rolls every provider bucket at UTC midnight", () => {
		const yesterday = utcDayStart(new Date("2026-09-15T10:00:00.000Z"));
		const decision = applyWarmupReservation({
			warmup: warmup({
				sentTodayByProvider: { ...emptyProviderCounts(), gmail: 80 },
				dailyWindowStart: yesterday,
			}),
			provider: "gmail",
			recipientCount: 1,
			now,
		});
		expect(decision.ok).toBe(true);
		if (!decision.ok) return;
		expect(decision.sentToday).toBe(1);
		expect(decision.sentTodayByProvider.gmail).toBe(1);
		expect(decision.dailyWindowStart).toEqual(utcDayStart(now));
	});

	test("marks warmup complete after day 42 for every provider", () => {
		const startedAt = new Date("2026-08-04T10:00:00.000Z");
		const decision = applyWarmupReservation({
			warmup: warmup({ startedAt }),
			provider: "yahoo",
			recipientCount: 5,
			now,
		});
		expect(decision.ok).toBe(true);
		if (!decision.ok) return;
		expect(decision.completed).toBe(true);
		expect(decision.status).toBe("completed");
		expect(decision.dailyCap).toBeNull();
		expect(decision.next.status).toBe("completed");
	});

	test("paused warmup never consumes a provider bucket", () => {
		const decision = applyWarmupReservation({
			warmup: warmup({ status: "paused" }),
			provider: "gmail",
			recipientCount: 1,
			now,
		});
		expect(decision.ok).toBe(false);
		if (decision.ok) return;
		expect(decision.reason).toBe("paused");
		expect(decision.pool).toBe("shared");
		expect(decision.next.sentTodayByProvider.gmail).toBe(0);
	});
});

describe("resolveEgressDecision", () => {
	const now = new Date("2026-09-16T10:00:00.000Z");

	test("orgs without an assignment stay on the shared pool", () => {
		const decision = resolveEgressDecision({
			assignment: null,
			provider: "gmail",
			recipientCount: 1,
			now,
		});
		expect(decision).toMatchObject({
			pool: "shared",
			reason: "no_assignment",
			provider: "gmail",
		});
	});

	test("a warmed dedicated IP stays dedicated with no daily cap", () => {
		const decision = resolveEgressDecision({
			assignment: {
				ipStatus: "active",
				warmup: warmup({ status: "completed" }),
			},
			provider: "microsoft",
			recipientCount: 50,
			now,
		});
		expect(decision.pool).toBe("dedicated");
		expect(decision.reason).toBe("warmed");
		expect(decision.dailyCap).toBeNull();
		expect(decision.provider).toBe("microsoft");
	});

	test("a disabled dedicated IP falls back to shared", () => {
		const decision = resolveEgressDecision({
			assignment: {
				ipStatus: "disabled",
				warmup: warmup(),
			},
			provider: "gmail",
			recipientCount: 1,
			now,
		});
		expect(decision.reason).toBe("ip_disabled");
		expect(decision.pool).toBe("shared");
	});
});

describe("assertCanAssignDedicatedIp", () => {
	const ip = { kind: "dedicated" as const, status: "active" as const };

	test("blocks shared IPs, inactive IPs, and orgs over entitlement", () => {
		expect(
			assertCanAssignDedicatedIp({
				ip: { kind: "shared", status: "active" },
				alreadyAssigned: false,
				orgExists: true,
				dedicatedIpCount: 1,
				currentOrgIpCount: 0,
			}).ok,
		).toBe(false);

		expect(
			assertCanAssignDedicatedIp({
				ip: { kind: "dedicated", status: "retired" },
				alreadyAssigned: false,
				orgExists: true,
				dedicatedIpCount: 1,
				currentOrgIpCount: 0,
			}),
		).toEqual({ ok: false, code: "not_active" });

		expect(
			assertCanAssignDedicatedIp({
				ip,
				alreadyAssigned: false,
				orgExists: true,
				dedicatedIpCount: 1,
				currentOrgIpCount: 1,
			}),
		).toEqual({ ok: false, code: "entitlement" });

		expect(
			assertCanAssignDedicatedIp({
				ip,
				alreadyAssigned: true,
				orgExists: true,
				dedicatedIpCount: 1,
				currentOrgIpCount: 0,
			}),
		).toEqual({ ok: false, code: "already_assigned" });
	});

	test("allows a dedicated active IP within entitlement", () => {
		expect(
			assertCanAssignDedicatedIp({
				ip,
				alreadyAssigned: false,
				orgExists: true,
				dedicatedIpCount: 1,
				currentOrgIpCount: 0,
			}),
		).toEqual({ ok: true });
	});
});
