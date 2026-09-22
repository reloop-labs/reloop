import { z } from "zod";

export const productSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	url: z.string().url(),
	tagline: z.string().min(1),
	description: z.string().min(1),
	shortDescription: z.string().min(1),
	logoPath: z.string().optional(),
	categories: z.array(z.string()).default([]),
	pricing: z.enum(["free", "freemium", "paid", "open-source"]).default("freemium"),
	pricingNote: z.string().optional(),
	github: z.string().optional(),
	docs: z.string().optional(),
	twitter: z.string().optional(),
	email: z.string().optional(),
	stage: z.enum(["prelaunch", "beta", "live"]).default("live"),
	hasPayingCustomers: z.boolean().default(false),
});

export type Product = z.infer<typeof productSchema>;

export const fillStepSchema = z.object({
	action: z.enum([
		"goto",
		"wait",
		"click",
		"fill",
		"select",
		"upload",
		"press",
		"waitForNav",
		"screenshot",
		"humanGate",
	]),
	url: z.string().optional(),
	selector: z.string().optional(),
	valueFrom: z
		.enum([
			"name",
			"url",
			"tagline",
			"description",
			"shortDescription",
			"email",
			"github",
			"docs",
			"twitter",
			"categories",
			"pricing",
			"pricingNote",
			"logoPath",
			"literal",
		])
		.optional(),
	literal: z.string().optional(),
	ms: z.number().optional(),
	optional: z.boolean().optional(),
	note: z.string().optional(),
	/** When set on humanGate, always pause for the user (not only on captcha detect). */
	force: z.boolean().optional(),
});

export const directorySchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	submitUrl: z.string().url(),
	homepage: z.string().url().optional(),
	pricing: z.literal("free"),
	domainRating: z.number().optional(),
	linkType: z.enum(["dofollow", "nofollow", "unknown"]).default("unknown"),
	approval: z.string().optional(),
	requiresAccount: z.boolean().default(false),
	notes: z.string().optional(),
	accepts: z.array(z.string()).default([]),
	rejects: z.array(z.string()).default([]),
	lastChecked: z.string().optional(),
	steps: z.array(fillStepSchema).min(1),
});

export type Directory = z.infer<typeof directorySchema>;
export type FillStep = z.infer<typeof fillStepSchema>;

export type SubmissionStatus =
	| "queued"
	| "running"
	| "needs_human"
	| "submitted"
	| "live"
	| "skipped"
	| "failed";

export type SubmissionRecord = {
	directoryId: string;
	directoryName: string;
	status: SubmissionStatus;
	at: string;
	url?: string;
	listingUrl?: string;
	error?: string;
	screenshot?: string;
	note?: string;
};

export type RunRecord = {
	id: string;
	productId: string;
	startedAt: string;
	updatedAt: string;
	status: "running" | "paused" | "completed" | "failed";
	submissions: SubmissionRecord[];
};
