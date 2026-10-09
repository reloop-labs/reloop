import { t } from "elysia";

export namespace StartupApplicationModel {
	export const createBody = t.Object({
		email: t.String({ format: "email", minLength: 3, maxLength: 255 }),
		fullName: t.String({ minLength: 1, maxLength: 120 }),
		company: t.String({ minLength: 1, maxLength: 160 }),
		website: t.Optional(t.String({ maxLength: 255 })),
		role: t.Optional(t.String({ maxLength: 120 })),
		monthlyVolume: t.Optional(t.String({ maxLength: 60 })),
		useCase: t.String({ minLength: 10, maxLength: 5000 }),
	});

	export const item = t.Object({
		id: t.String(),
		email: t.String(),
		fullName: t.String(),
		company: t.String(),
		website: t.Union([t.String(), t.Null()]),
		role: t.Union([t.String(), t.Null()]),
		monthlyVolume: t.Union([t.String(), t.Null()]),
		useCase: t.String(),
		status: t.Union([
			t.Literal("pending"),
			t.Literal("approved"),
			t.Literal("rejected"),
			t.Literal("contacted"),
		]),
		reviewedAt: t.Union([t.Date(), t.Null()]),
		reviewNote: t.Union([t.String(), t.Null()]),
		createdAt: t.Date(),
		updatedAt: t.Date(),
	});

	export const createResponse = t.Object({
		id: t.String(),
		status: t.String(),
		createdAt: t.Date(),
	});

	export const listResponse = t.Object({
		items: t.Array(item),
		total: t.Number(),
	});

	export const updateBody = t.Object({
		status: t.Union([
			t.Literal("pending"),
			t.Literal("approved"),
			t.Literal("rejected"),
			t.Literal("contacted"),
		]),
		reviewNote: t.Optional(t.String({ maxLength: 5000 })),
	});
}
