import { authMiddleware } from "@reloop/domain/middleware/auth";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { Elysia } from "elysia";
import { listSendingIpsController } from "./list-sending-ips.controllers";

export const listSendingIpsRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/sending-ips",
		async ({ organizationId }) => listSendingIpsController(organizationId),
		{
			auth: true,
			response: {
				200: DomainModel.organizationSendingIpsResponse,
				403: DomainModel.unauthorized,
			},
			detail: {
				tags: ["Sending IPs"],
				summary: "List dedicated sending IPs",
				description:
					"Returns dedicated sending IPs assigned to the active organization, including per-provider warmup progress.",
			},
		},
	);
