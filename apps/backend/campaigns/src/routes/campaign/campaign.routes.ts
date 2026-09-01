import { ErrorResponseSchema } from "@be/campaigns/error/campaign.error";
import { authMiddleware } from "@be/campaigns/middleware/auth";
import {
	campaignListQuery,
	campaignRecipientSchema,
	campaignResponseSchema,
	createCampaignBody,
	scheduleBody,
	testSendBody,
	updateCampaignBody,
} from "@be/campaigns/model/campaign.model";
import { auditLogHook } from "@be/campaigns/utils/audit-log";
import { Elysia, t } from "elysia";
import {
	cancelCampaignController,
	createCampaignController,
	deleteCampaignController,
	duplicateCampaignController,
	getCampaignController,
	listCampaignsController,
	listRecipientsController,
	scheduleCampaignController,
	sendCampaignController,
	testCampaignController,
	updateCampaignController,
} from "./campaign.controllers";

const errorResponses = {
	400: ErrorResponseSchema,
	401: ErrorResponseSchema,
	403: ErrorResponseSchema,
	404: ErrorResponseSchema,
	409: ErrorResponseSchema,
	500: ErrorResponseSchema,
};

export const campaignRoutes = new Elysia({
	prefix: "/v1",
	name: "CampaignRoutes",
})
	.use(authMiddleware)
	.post(
		"/create",
		async ({ body, userId, organizationId }) => {
			return await createCampaignController({
				organizationId,
				userId,
				body,
			});
		},
		{
			auth: true,
			body: createCampaignBody,
			response: { 200: campaignResponseSchema, ...errorResponses },
			detail: {
				tags: ["Campaigns"],
				summary: "Create a campaign",
				description:
					"Creates a draft broadcast campaign. Pass sendImmediately or scheduledAt to start delivery.",
			},
			afterResponse: auditLogHook({
				resourceType: "campaign",
				action: "created",
			}),
		},
	)
	.get(
		"/list",
		async ({ query, organizationId }) => {
			return await listCampaignsController({
				organizationId,
				page: query.page,
				limit: query.limit,
				search: query.search,
				status: query.status,
			});
		},
		{
			auth: true,
			query: campaignListQuery,
			response: {
				200: t.Object({
					campaigns: t.Array(campaignResponseSchema),
					total: t.Number(),
					page: t.Number(),
					limit: t.Number(),
				}),
				...errorResponses,
			},
			detail: {
				tags: ["Campaigns"],
				summary: "List campaigns",
			},
		},
	)
	.get(
		"/:id",
		async ({ params, organizationId }) => {
			return await getCampaignController({
				id: params.id,
				organizationId,
			});
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			response: { 200: campaignResponseSchema, ...errorResponses },
			detail: { tags: ["Campaigns"], summary: "Get a campaign" },
		},
	)
	.patch(
		"/:id",
		async ({ params, body, organizationId }) => {
			return await updateCampaignController({
				id: params.id,
				organizationId,
				body,
			});
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			body: updateCampaignBody,
			response: { 200: campaignResponseSchema, ...errorResponses },
			detail: { tags: ["Campaigns"], summary: "Update a draft campaign" },
			afterResponse: auditLogHook({
				resourceType: "campaign",
				action: "updated",
			}),
		},
	)
	.post(
		"/:id/send",
		async ({ params, organizationId }) => {
			return await sendCampaignController({
				id: params.id,
				organizationId,
			});
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			response: { 200: campaignResponseSchema, ...errorResponses },
			detail: { tags: ["Campaigns"], summary: "Send a campaign now" },
			afterResponse: auditLogHook({
				resourceType: "campaign",
				action: "sent",
			}),
		},
	)
	.post(
		"/:id/schedule",
		async ({ params, body, organizationId }) => {
			return await scheduleCampaignController({
				id: params.id,
				organizationId,
				scheduledAt: body.scheduledAt,
			});
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			body: scheduleBody,
			response: { 200: campaignResponseSchema, ...errorResponses },
			detail: { tags: ["Campaigns"], summary: "Schedule a campaign" },
		},
	)
	.post(
		"/:id/cancel",
		async ({ params, organizationId }) => {
			return await cancelCampaignController({
				id: params.id,
				organizationId,
			});
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			response: { 200: campaignResponseSchema, ...errorResponses },
			detail: { tags: ["Campaigns"], summary: "Cancel a campaign" },
		},
	)
	.post(
		"/:id/duplicate",
		async ({ params, organizationId, userId }) => {
			return await duplicateCampaignController({
				id: params.id,
				organizationId,
				userId,
			});
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			response: { 200: campaignResponseSchema, ...errorResponses },
			detail: { tags: ["Campaigns"], summary: "Duplicate a campaign" },
		},
	)
	.delete(
		"/:id",
		async ({ params, organizationId }) => {
			return await deleteCampaignController({
				id: params.id,
				organizationId,
			});
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({ success: t.Boolean(), id: t.Optional(t.String()) }),
				...errorResponses,
			},
			detail: {
				tags: ["Campaigns"],
				summary: "Delete a draft or cancelled campaign",
			},
			afterResponse: auditLogHook({
				resourceType: "campaign",
				action: "deleted",
			}),
		},
	)
	.post(
		"/:id/test",
		async ({ params, body, organizationId }) => {
			return await testCampaignController({
				id: params.id,
				organizationId,
				to: body.to,
				variables: body.variables,
			});
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			body: testSendBody,
			response: {
				200: t.Object({ success: t.Boolean() }),
				...errorResponses,
			},
			detail: {
				tags: ["Campaigns"],
				summary: "Send a test email for a campaign",
			},
		},
	)
	.get(
		"/:id/recipients",
		async ({ params, query, organizationId }) => {
			return await listRecipientsController({
				id: params.id,
				organizationId,
				page: query.page,
				limit: query.limit,
				status: query.status,
			});
		},
		{
			auth: true,
			params: t.Object({ id: t.String() }),
			query: t.Object({
				page: t.Optional(t.Number()),
				limit: t.Optional(t.Number()),
				status: t.Optional(
					t.Union([
						t.Literal("pending"),
						t.Literal("sending"),
						t.Literal("sent"),
						t.Literal("skipped"),
						t.Literal("failed"),
					]),
				),
			}),
			response: {
				200: t.Object({
					recipients: t.Array(campaignRecipientSchema),
					total: t.Number(),
					page: t.Number(),
					limit: t.Number(),
				}),
				...errorResponses,
			},
			detail: { tags: ["Campaigns"], summary: "List campaign recipients" },
		},
	);
