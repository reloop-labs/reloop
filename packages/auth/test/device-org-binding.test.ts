import { describe, expect, test } from "bun:test";
import { DEVICE_CODE_GRANT_TYPE } from "@better-auth/oauth-provider";
import {
	bindDeviceRefreshTokens,
	deviceOrgClaimsExtension,
	readDeviceOrgBinding,
} from "@reloop/auth/server/device-org-binding";
import { MemoryRedis } from "./memory-redis";

const binding = {
	organizationId: "org-1",
	userId: "user-1",
	clientId: "reloop-cli",
	approvedAtMs: Date.parse("2026-10-11T12:00:00Z"),
};

async function seeded(): Promise<MemoryRedis> {
	const redis = new MemoryRedis();
	await redis.set("oauth:device-org:dev-123", binding);
	return redis;
}

function claimInput(grantType: string | undefined, body: unknown) {
	return {
		ctx: { body },
		grantType,
		scopes: [],
	} as never;
}

describe("deviceOrgClaimsExtension", () => {
	test("adds org_id to access tokens minted from an approved device code", async () => {
		const accessToken = deviceOrgClaimsExtension(await seeded()).claims
			?.accessToken;
		expect(
			await accessToken?.(
				claimInput(DEVICE_CODE_GRANT_TYPE, { device_code: "dev-123" }),
			),
		).toEqual({ org_id: "org-1" });
	});

	test("adds nothing for other grants or unknown device codes", async () => {
		const accessToken = deviceOrgClaimsExtension(await seeded()).claims
			?.accessToken;
		expect(
			await accessToken?.(
				claimInput("refresh_token", { device_code: "dev-123" }),
			),
		).toEqual({});
		expect(
			await accessToken?.(
				claimInput(DEVICE_CODE_GRANT_TYPE, { device_code: "dev-unknown" }),
			),
		).toEqual({});
	});
});

describe("bindDeviceRefreshTokens", () => {
	function fakeDb(stampedIds: string[]) {
		const updates: unknown[] = [];
		const db = {
			update: () => ({
				set: (values: unknown) => ({
					where: () => ({
						returning: async () => {
							updates.push(values);
							return stampedIds.map((id) => ({ id }));
						},
					}),
				}),
			}),
		};
		return { db: db as never, updates };
	}

	test("stamps the org on the new refresh token and reports it", async () => {
		const { db, updates } = fakeDb(["rt-1"]);
		expect(await bindDeviceRefreshTokens(db, binding)).toBe(1);
		expect(updates).toEqual([{ referenceId: "org-1" }]);
	});

	test("reports zero while the CLI is still polling", async () => {
		const { db } = fakeDb([]);
		expect(await bindDeviceRefreshTokens(db, binding)).toBe(0);
	});

	test("reads back what approval stored", async () => {
		expect(await readDeviceOrgBinding(await seeded(), "dev-123")).toEqual(
			binding,
		);
		expect(await readDeviceOrgBinding(new MemoryRedis(), "dev-123")).toBeNull();
	});
});
