import * as z from "zod";
import { defineTool } from "../define";
import {
	automationIdSchema,
	enrollmentSchema,
	enrollmentStatusSchema,
	paginationSchema,
	toEnrollmentOutput,
} from "./schemas";

export const listEnrollments = defineTool({
	name: "list_enrollments",
	title: "List enrollments",
	description:
		"List the contacts that went through an automation, newest first, with where each one is (`currentStep`) and whether it is active, completed, cancelled or failed. Use get_enrollment to see what happened at each step, for example to find out why someone did not get an email.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		automationId: automationIdSchema,
		status: enrollmentStatusSchema
			.optional()
			.describe("Only enrollments with this status"),
		page: z.number().int().min(1).default(1).describe("1-based page number"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(20)
			.describe("Enrollments per page, 1 to 100"),
	}),
	output: z.object({
		enrollments: z.array(enrollmentSchema),
		pagination: paginationSchema,
	}),
	async run(args, api) {
		const response = await api.automations.listEnrollments(args.automationId, {
			page: args.page,
			limit: args.limit,
			status: args.status,
		});
		return {
			enrollments: response.enrollments.map(toEnrollmentOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
