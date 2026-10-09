import { db } from "@reloop/db/client";
import { startupApplication } from "@reloop/db/schema";
import { count, desc, eq, ilike, or } from "drizzle-orm";
import { createError } from "evlog";

export type CreateStartupApplicationInput = {
	email: string;
	fullName: string;
	company: string;
	website?: string;
	role?: string;
	monthlyVolume?: string;
	useCase: string;
};

const normalizeOptional = (value?: string): string | null => {
	if (!value) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

export async function createStartupApplicationController(
	input: CreateStartupApplicationInput,
) {
	const email = input.email.trim().toLowerCase();
	const [row] = await db
		.insert(startupApplication)
		.values({
			email,
			fullName: input.fullName.trim(),
			company: input.company.trim(),
			website: normalizeOptional(input.website),
			role: normalizeOptional(input.role),
			monthlyVolume: normalizeOptional(input.monthlyVolume),
			useCase: input.useCase.trim(),
		})
		.returning({
			id: startupApplication.id,
			status: startupApplication.status,
			createdAt: startupApplication.createdAt,
		});

	if (!row) {
		throw createError({
			status: 500,
			message: "Failed to save application",
			why: "Insert returned no row.",
			fix: "Try again in a moment.",
		});
	}

	return row;
}

export async function listStartupApplicationsController(opts: {
	limit?: number;
	offset?: number;
	status?: string;
	q?: string;
}) {
	const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
	const offset = Math.max(opts.offset ?? 0, 0);

	const filters = [];
	if (opts.status) {
		filters.push(eq(startupApplication.status, opts.status as never));
	}
	if (opts.q) {
		const pattern = `%${opts.q.trim()}%`;
		filters.push(
			or(
				ilike(startupApplication.email, pattern),
				ilike(startupApplication.company, pattern),
				ilike(startupApplication.fullName, pattern),
			)!,
		);
	}

	const where = filters.length > 0 ? filters[0]! : undefined;

	const items = await db
		.select()
		.from(startupApplication)
		.where(where as never)
		.orderBy(desc(startupApplication.createdAt))
		.limit(limit)
		.offset(offset);

	const totalRows = await db
		.select({ value: count() })
		.from(startupApplication)
		.where(where as never);

	return { items, total: totalRows[0]?.value ?? 0 };
}

export async function getStartupApplicationController(id: string) {
	const rows = await db
		.select()
		.from(startupApplication)
		.where(eq(startupApplication.id, id))
		.limit(1);
	const row = rows[0];
	if (!row) {
		throw createError({
			status: 404,
			message: "Application not found",
			why: `No startup application with id ${id}.`,
			fix: "Check the id and try again.",
		});
	}
	return row;
}

export async function updateStartupApplicationController(
	id: string,
	input: {
		status: "pending" | "approved" | "rejected" | "contacted";
		reviewNote?: string;
	},
) {
	const [row] = await db
		.update(startupApplication)
		.set({
			status: input.status,
			reviewNote: input.reviewNote?.trim() || null,
			reviewedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(startupApplication.id, id))
		.returning();

	if (!row) {
		throw createError({
			status: 404,
			message: "Application not found",
			why: `No startup application with id ${id}.`,
			fix: "Check the id and try again.",
		});
	}
	return row;
}
