import { describe, expect, test } from "bun:test";
import { validateTrackProperties } from "./validate-properties";

function def(overrides: {
	name: string;
	propertyType?: "string" | "number" | "boolean";
	required?: boolean;
	defaultValue?: string | null;
}) {
	return {
		id: `evtp_${overrides.name}`,
		eventId: "evt_1",
		organizationId: "org_1",
		name: overrides.name,
		propertyType: overrides.propertyType ?? "string",
		required: overrides.required ?? false,
		defaultValue: overrides.defaultValue ?? null,
		description: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

describe("validateTrackProperties", () => {
	test("fills required defaults and coerces numbers", () => {
		const result = validateTrackProperties({
			defs: [
				def({ name: "plan", required: true, defaultValue: "free" }),
				def({ name: "seats", propertyType: "number" }),
			],
			properties: { seats: "3" },
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.normalized).toEqual({ plan: "free", seats: 3 });
		}
	});

	test("rejects a missing required property", () => {
		const result = validateTrackProperties({
			defs: [def({ name: "plan", required: true })],
			properties: {},
		});
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Missing required property "plan".');
		}
	});
});
