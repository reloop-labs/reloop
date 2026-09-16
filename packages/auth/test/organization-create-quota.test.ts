import { describe, expect, test } from "bun:test";
import {
	canCreateAnotherOrganization,
	isFreePlanId,
	memberRoleIncludesOwner,
} from "../src/organization-create-quota";

describe("canCreateAnotherOrganization", () => {
	test("allows the first organization", () => {
		expect(canCreateAnotherOrganization([])).toEqual({ ok: true });
	});

	test("blocks a second org while any owned org is free", () => {
		expect(canCreateAnotherOrganization(["free"])).toEqual({ ok: false });
		expect(canCreateAnotherOrganization(["individual", "free"])).toEqual({
			ok: false,
		});
		expect(canCreateAnotherOrganization([null])).toEqual({ ok: false });
	});

	test("allows another org when every owned org is paid", () => {
		expect(canCreateAnotherOrganization(["individual"])).toEqual({ ok: true });
		expect(canCreateAnotherOrganization(["startup", "enterprise"])).toEqual({
			ok: true,
		});
	});
});

describe("isFreePlanId", () => {
	test("treats missing and free as free", () => {
		expect(isFreePlanId("free")).toBe(true);
		expect(isFreePlanId(null)).toBe(true);
		expect(isFreePlanId(undefined)).toBe(true);
		expect(isFreePlanId("individual")).toBe(false);
	});
});

describe("memberRoleIncludesOwner", () => {
	test("matches owner even in comma-separated roles", () => {
		expect(memberRoleIncludesOwner("owner")).toBe(true);
		expect(memberRoleIncludesOwner("owner,admin")).toBe(true);
		expect(memberRoleIncludesOwner("member")).toBe(false);
	});
});
