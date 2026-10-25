import { describe, expect, test } from "bun:test";
import type { ApiKeyScope } from "@reloop/db/api-key-scope";
import {
	assertAddressAllowed,
	assertMailboxAllowed,
	bareAddress,
	buildMailboxScope,
	listMailboxFilter,
	type MailboxScope,
	resolveMailboxScope,
	scopeAllowsMailbox,
	UNRESTRICTED_MAILBOX_SCOPE,
} from "../src/lib/api-key-mailbox-scope";
import { senderScopeCondition } from "../src/routes/messages/list-sent-messages/list-sent-messages.controllers";

const MAILBOXES = [
	{ id: "mbx_agent", email: "agent@agents.acme.com" },
	{ id: "mbx_support", email: "support@acme.com" },
	{ id: "mbx_billing", email: "Billing@Acme.com" },
];

const domainScope: ApiKeyScope = {
	restricted: true,
	entries: [{ domain: "agents.acme.com", email: null, domainDeleted: false }],
};

const addressScope: ApiKeyScope = {
	restricted: true,
	entries: [
		{ domain: "acme.com", email: "billing@acme.com", domainDeleted: false },
	],
};

type ErrorShape = Error & {
	status?: number;
	why?: string;
	fix?: string;
	link?: string;
};

function catchError(fn: () => void): ErrorShape | undefined {
	try {
		fn();
	} catch (err) {
		return err as ErrorShape;
	}
	return undefined;
}

describe("buildMailboxScope", () => {
	test("an unrestricted key sees every mailbox", () => {
		const scope = buildMailboxScope(
			{ restricted: false, entries: [] },
			MAILBOXES,
		);
		expect(scope.restricted).toBe(false);
		for (const m of MAILBOXES) {
			expect(scopeAllowsMailbox(scope, m.id)).toBe(true);
		}
	});

	test("a domain-restricted key only sees mailboxes on that domain", () => {
		const scope = buildMailboxScope(domainScope, MAILBOXES);
		expect(scope.restricted && scope.mailboxIds).toEqual(["mbx_agent"]);
		expect(scopeAllowsMailbox(scope, "mbx_agent")).toBe(true);
		expect(scopeAllowsMailbox(scope, "mbx_support")).toBe(false);
	});

	test("an address-restricted key matches case-insensitively", () => {
		const scope = buildMailboxScope(addressScope, MAILBOXES);
		expect(scope.restricted && scope.mailboxIds).toEqual(["mbx_billing"]);
	});

	test("a scope on a deleted domain allows nothing", () => {
		const scope = buildMailboxScope(
			{
				restricted: true,
				entries: [
					{ domain: "agents.acme.com", email: null, domainDeleted: true },
				],
			},
			MAILBOXES,
		);
		expect(scope.restricted && scope.mailboxIds).toEqual([]);
	});
});

describe("scopeAllowsMailbox", () => {
	const scope = buildMailboxScope(domainScope, MAILBOXES);

	test("threads without a mailbox are hidden from restricted keys", () => {
		expect(scopeAllowsMailbox(scope, null)).toBe(false);
		expect(scopeAllowsMailbox(scope, undefined)).toBe(false);
	});

	test("threads without a mailbox stay visible without restrictions", () => {
		expect(scopeAllowsMailbox(UNRESTRICTED_MAILBOX_SCOPE, null)).toBe(true);
	});
});

describe("assertMailboxAllowed", () => {
	const scope = buildMailboxScope(domainScope, MAILBOXES);

	test("passes for an allowed mailbox", () => {
		expect(
			catchError(() => assertMailboxAllowed(scope, "mbx_agent")),
		).toBeUndefined();
	});

	test("returns 403 with why, fix and link for another mailbox", () => {
		const err = catchError(() => assertMailboxAllowed(scope, "mbx_support"));
		expect(err?.status).toBe(403);
		expect(err?.message).toBe("API key is not allowed to access this mailbox");
		expect(err?.why).toContain("mbx_support");
		expect(err?.fix).toBeTruthy();
		expect(err?.link).toContain("/docs/");
	});

	test("never throws for sessions", () => {
		expect(
			catchError(() =>
				assertMailboxAllowed(UNRESTRICTED_MAILBOX_SCOPE, "mbx_support"),
			),
		).toBeUndefined();
	});
});

describe("assertAddressAllowed", () => {
	const scope = buildMailboxScope(domainScope, MAILBOXES);

	test("allows a new mailbox on the allowed domain", () => {
		expect(
			catchError(() => assertAddressAllowed(scope, "new@agents.acme.com")),
		).toBeUndefined();
	});

	test("blocks a new mailbox on another domain", () => {
		const err = catchError(() => assertAddressAllowed(scope, "CEO@acme.com"));
		expect(err?.status).toBe(403);
		expect(err?.why).toContain("ceo@acme.com");
	});
});

describe("listMailboxFilter", () => {
	const scope: MailboxScope = buildMailboxScope(domainScope, MAILBOXES);

	test("no filter for sessions and unrestricted keys", () => {
		expect(listMailboxFilter(UNRESTRICTED_MAILBOX_SCOPE)).toBeUndefined();
	});

	test("restricted keys list only their mailboxes", () => {
		expect(listMailboxFilter(scope)).toEqual(["mbx_agent"]);
	});

	test("asking for an allowed mailbox narrows to it", () => {
		expect(listMailboxFilter(scope, "mbx_agent")).toEqual(["mbx_agent"]);
	});

	test("asking for another mailbox is a 403, not an empty list", () => {
		const err = catchError(() => listMailboxFilter(scope, "mbx_support"));
		expect(err?.status).toBe(403);
	});
});

describe("resolveMailboxScope", () => {
	test("requests without an API key (dashboard sessions) are unrestricted", async () => {
		expect(await resolveMailboxScope("org_1", undefined)).toEqual(
			UNRESTRICTED_MAILBOX_SCOPE,
		);
	});
});

describe("senderScopeCondition", () => {
	test("returns SQL when the key allows at least one sender", () => {
		expect(senderScopeCondition(domainScope)).not.toBeNull();
		expect(senderScopeCondition(addressScope)).not.toBeNull();
	});

	test("returns null when every scoped domain is deleted", () => {
		expect(
			senderScopeCondition({
				restricted: true,
				entries: [{ domain: "acme.com", email: null, domainDeleted: true }],
			}),
		).toBeNull();
	});
});

describe("bareAddress", () => {
	test("extracts the address from a display name", () => {
		expect(bareAddress("Acme Billing <Billing@Acme.com>")).toBe(
			"billing@acme.com",
		);
		expect(bareAddress(" agent@agents.acme.com ")).toBe(
			"agent@agents.acme.com",
		);
	});
});
