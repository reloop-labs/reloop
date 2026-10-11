import * as z from "zod";
import { defineTool } from "../define";
import {
	propertySchema,
	propertyTypeSchema,
	toPropertyOutput,
} from "./schemas";

export const listProperties = defineTool({
	name: "list_properties",
	title: "List contact properties",
	description:
		"List the custom contact property definitions of the authenticated Reloop organization: each key, its type, and its fallback value, with offset pagination. Use this before create_contact or update_contact to learn which `properties` keys exist and whether they hold strings or numbers.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		page: z.number().int().min(1).default(1).describe("1-based page number"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(100)
			.describe("Properties per page, 1 to 100"),
		search: z
			.string()
			.trim()
			.min(1)
			.max(64)
			.optional()
			.describe(
				"Case-insensitive substring to match against the property name",
			),
		type: propertyTypeSchema
			.optional()
			.describe("Only return properties of this type"),
	}),
	output: z.object({
		properties: z.array(propertySchema),
		pagination: z.object({
			page: z.number().int(),
			limit: z.number().int(),
			total: z.number().int(),
			hasMore: z.boolean(),
		}),
	}),
	async run(args, api) {
		const response = await api.properties.list({
			page: args.page,
			limit: args.limit,
			search: args.search,
			type: args.type,
		});
		return {
			properties: response.properties.map(toPropertyOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
