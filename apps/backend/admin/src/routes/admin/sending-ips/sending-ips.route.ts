import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import {
	assignSendingIpController,
	createSendingIpController,
	getSendingIpController,
	listOrganizationSendingIpsController,
	listSendingIpsController,
	unassignSendingIpController,
	updateSendingIpController,
	warmupSendingIpController,
} from "./sending-ips.controllers";

export const sendingIpsRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/sending-ips",
		async ({ query }) =>
			listSendingIpsController({
				limit: query.limit,
				offset: query.offset,
				q: query.q,
				kind: query.kind,
				status: query.status,
				assigned:
					query.assigned === undefined
						? undefined
						: query.assigned === "true" || query.assigned === true,
			}),
		{
			authAdmin: true,
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
				q: t.Optional(t.String()),
				kind: t.Optional(AdminModel.sendingIpKind),
				status: t.Optional(AdminModel.sendingIpStatus),
				assigned: t.Optional(
					t.Union([t.Boolean(), t.Literal("true"), t.Literal("false")]),
				),
			}),
			response: {
				200: AdminModel.sendingIpsResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List sending IP inventory",
			},
		},
	)
	.post(
		"/sending-ips",
		async ({ body, userId }) =>
			createSendingIpController({
				address: body.address,
				hostname: body.hostname,
				kind: body.kind,
				notes: body.notes,
				actorUserId: userId,
			}),
		{
			authAdmin: true,
			body: AdminModel.createSendingIpBody,
			response: {
				200: AdminModel.sendingIpItem,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Register a sending IP",
			},
		},
	)
	.get(
		"/sending-ips/:sendingIpId",
		async ({ params }) => getSendingIpController(params.sendingIpId),
		{
			authAdmin: true,
			params: t.Object({ sendingIpId: t.String() }),
			response: {
				200: AdminModel.sendingIpItem,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Get a sending IP",
			},
		},
	)
	.patch(
		"/sending-ips/:sendingIpId",
		async ({ params, body, userId }) =>
			updateSendingIpController({
				sendingIpId: params.sendingIpId,
				hostname: body.hostname,
				status: body.status,
				notes: body.notes,
				actorUserId: userId,
			}),
		{
			authAdmin: true,
			params: t.Object({ sendingIpId: t.String() }),
			body: AdminModel.updateSendingIpBody,
			response: {
				200: AdminModel.sendingIpItem,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Update a sending IP",
			},
		},
	)
	.post(
		"/sending-ips/:sendingIpId/assign",
		async ({ params, body, userId }) =>
			assignSendingIpController({
				sendingIpId: params.sendingIpId,
				organizationId: body.organizationId,
				isPrimary: body.isPrimary,
				overflow: body.overflow,
				startWarmup: body.startWarmup,
				actorUserId: userId,
			}),
		{
			authAdmin: true,
			params: t.Object({ sendingIpId: t.String() }),
			body: AdminModel.assignSendingIpBody,
			response: {
				200: AdminModel.sendingIpItem,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Assign a dedicated IP to an organization",
			},
		},
	)
	.post(
		"/sending-ips/:sendingIpId/unassign",
		async ({ params, userId }) =>
			unassignSendingIpController({
				sendingIpId: params.sendingIpId,
				actorUserId: userId,
			}),
		{
			authAdmin: true,
			params: t.Object({ sendingIpId: t.String() }),
			response: {
				200: AdminModel.sendingIpItem,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Unassign a dedicated IP",
			},
		},
	)
	.post(
		"/sending-ips/:sendingIpId/warmup",
		async ({ params, body, userId }) =>
			warmupSendingIpController({
				sendingIpId: params.sendingIpId,
				action: body.action,
				actorUserId: userId,
			}),
		{
			authAdmin: true,
			params: t.Object({ sendingIpId: t.String() }),
			body: AdminModel.warmupActionBody,
			response: {
				200: AdminModel.sendingIpItem,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Pause, resume, complete, or restart IP warmup",
			},
		},
	)
	.get(
		"/organizations/:organizationId/sending-ips",
		async ({ params }) =>
			listOrganizationSendingIpsController(params.organizationId),
		{
			authAdmin: true,
			params: t.Object({ organizationId: t.String() }),
			response: {
				200: AdminModel.organizationSendingIpsResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List dedicated IPs assigned to an organization",
			},
		},
	);
