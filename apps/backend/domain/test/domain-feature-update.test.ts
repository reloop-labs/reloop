import { describe, expect, test } from "bun:test";
import {
	receivingTurnedOff,
	resolveDomainFeatureFlags,
	sendingTurnedOff,
	shouldReverifyDomainAfterFeatureUpdate,
	trackingTurnedOff,
} from "../src/utils/domain-feature-update";

const active = {
	sending: true,
	receiving: true,
	clickTracking: true,
	openTracking: true,
};

describe("shouldReverifyDomainAfterFeatureUpdate", () => {
	test("does not re-verify a pending domain", () => {
		expect(
			shouldReverifyDomainAfterFeatureUpdate({
				previousStatus: "pending",
				previous: { ...active, sending: false },
				next: active,
			}),
		).toBe(false);
	});

	test("does not re-verify when sending, receiving, or tracking is turned off", () => {
		expect(
			shouldReverifyDomainAfterFeatureUpdate({
				previousStatus: "active",
				previous: active,
				next: { ...active, sending: false },
			}),
		).toBe(false);
		expect(
			shouldReverifyDomainAfterFeatureUpdate({
				previousStatus: "active",
				previous: active,
				next: { ...active, receiving: false },
			}),
		).toBe(false);
		expect(
			shouldReverifyDomainAfterFeatureUpdate({
				previousStatus: "active",
				previous: active,
				next: { ...active, clickTracking: false, openTracking: false },
			}),
		).toBe(false);
	});

	test("re-verifies only when a feature is newly turned on", () => {
		expect(
			shouldReverifyDomainAfterFeatureUpdate({
				previousStatus: "active",
				previous: { ...active, sending: false },
				next: active,
			}),
		).toBe(true);
		expect(
			shouldReverifyDomainAfterFeatureUpdate({
				previousStatus: "active",
				previous: { ...active, receiving: false },
				next: active,
			}),
		).toBe(true);
		expect(
			shouldReverifyDomainAfterFeatureUpdate({
				previousStatus: "active",
				previous: { ...active, clickTracking: false, openTracking: false },
				next: { ...active, clickTracking: true, openTracking: false },
			}),
		).toBe(true);
	});
});

describe("feature off helpers", () => {
	test("detects sending, receiving, and tracking being turned off", () => {
		const next = resolveDomainFeatureFlags(active, {
			sending: false,
			receiving: false,
			clickTracking: false,
			openTracking: false,
		});
		expect(sendingTurnedOff(active, next)).toBe(true);
		expect(receivingTurnedOff(active, next)).toBe(true);
		expect(trackingTurnedOff(active, next)).toBe(true);
	});
});
