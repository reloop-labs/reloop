import { describe, expect, test } from "bun:test";
import {
	applyWarmupReservation,
	assertCanAssignDedicatedIp,
	DEFAULT_WARMUP_SCHEDULE,
	dailyCapForDay,
	resolveEgressDecision,
	type WarmupSnapshot,
	warmupDayNumber,
} from "../src/ip-warmup";
import { utcDayStart } from "../src/reserve-send-credits";
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
		sentToday: 0,
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

	test("uses the 6-week conservative caps, then unlimited", () => {
		expect(dailyCapForDay(DEFAULT_WARMUP_SCHEDULE, 1)).toBe(200);
		expect(dailyCapForDay(DEFAULT_WARMUP_SCHEDULE, 7)).toBe(200);
		expect(dailyCapForDay(DEFAULT_WARMUP_SCHEDULE, 8)).toBe(500);
		expect(dailyCapForDay(DEFAULT_WARMUP_SCHEDULE, 21)).toBe(1_000);
		expect(dailyCapForDay(DEFAULT_WARMUP_SCHEDULE, 28)).toBe(2_500);
		expect(dailyCapForDay(DEFAULT_WARMUP_SCHEDULE, 35)).toBe(5_000);
		expect(dailyCapForDay(DEFAULT_WARMUP_SCHEDULE, 42)).toBe(10_000);
		expect(dailyCapForDay(DEFAULT_WARMUP_SCHEDULE, 43)).toBeNull();
	});
});

describe("applyWarmupReservation", () => {
	const now = new Date("2026-09-16T10:00:00.000Z");

	test("week 1 accepts 200 sends and overflows the 201st to the shared pool", () => {
		let state = warmup();
		let accepted = 0;
		let overflowed = 0;

		for (let i = 0; i < 250; i++) {
			const decision = applyWarmupReservation({
				warmup: state,
				recipientCount: 1,
				now,
			});
			if (decision.ok) {
				state = decision.next;
				accepted += 1;
			} else if (decision.reason === "overflow") {
				overflowed += 1;
				expect(decision.pool).toBe("shared");
			}
		}

		expect(accepted).toBe(200);
		expect(overflowed).toBe(50);
		expect(state.sentToday).toBe(200);
	});

	test("defer overflow keeps the send off the dedicated IP", () => {
		const decision = applyWarmupReservation({
			warmup: warmup({ overflow: "defer", sentToday: 200 }),
			recipientCount: 1,
			now,
		});
		expect(decision.ok).toBe(false);
		if (decision.ok) return;
		expect(decision.reason).toBe("overflow");
		expect(decision.pool).toBe("defer");
	});

	test("rolls the daily window at UTC midnight", () => {
		const yesterday = utcDayStart(new Date("2026-09-15T10:00:00.000Z"));
		const decision = applyWarmupReservation({
			warmup: warmup({ sentToday: 200, dailyWindowStart: yesterday }),
			recipientCount: 1,
			now,
		});
		expect(decision.ok).toBe(true);
		if (!decision.ok) return;
		expect(decision.sentToday).toBe(1);
		expect(decision.dailyWindowStart).toEqual(utcDayStart(now));
	});

	test("marks warmup complete after day 42", () => {
		const startedAt = new Date("2026-08-04T10:00:00.000Z");
		const decision = applyWarmupReservation({
			warmup: warmup({ startedAt }),
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

	test("paused warmup never consumes dedicated volume", () => {
		const decision = applyWarmupReservation({
			warmup: warmup({ status: "paused" }),
			recipientCount: 1,
			now,
		});
		expect(decision.ok).toBe(false);
		if (decision.ok) return;
		expect(decision.reason).toBe("paused");
		expect(decision.pool).toBe("shared");
		expect(decision.next.sentToday).toBe(0);
	});
});

describe("resolveEgressDecision", () => {
	const now = new Date("2026-09-16T10:00:00.000Z");

	test("orgs without an assignment stay on the shared pool", () => {
		const decision = resolveEgressDecision({
			assignment: null,
			recipientCount: 1,
			now,
		});
		expect(decision).toMatchObject({
			pool: "shared",
			reason: "no_assignment",
		});
	});

	test("a warmed dedicated IP stays dedicated with no daily cap", () => {
		const decision = resolveEgressDecision({
			assignment: {
				ipStatus: "active",
				warmup: warmup({ status: "completed" }),
			},
			recipientCount: 50,
			now,
		});
		expect(decision.pool).toBe("dedicated");
		expect(decision.reason).toBe("warmed");
		expect(decision.dailyCap).toBeNull();
	});

	test("a disabled dedicated IP falls back to shared", () => {
		const decision = resolveEgressDecision({
			assignment: {
				ipStatus: "disabled",
				warmup: warmup(),
			},
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
