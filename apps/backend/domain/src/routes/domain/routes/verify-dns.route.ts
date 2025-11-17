import { authMiddleware } from "@be/domain/middleware/auth";
import { VerifyModel } from "@be/domain/model/verify.model";
import { verifyDNSRecordHandler } from "@be/domain/routes/domain/controllers/verify-dns-record";
import { Elysia } from "elysia";

export const verifyDNSRecordRoute = new Elysia().use(authMiddleware).post(
	"/verify",
	async ({ body }) => {
		return await verifyDNSRecordHandler(body);
	},
	{
		body: VerifyModel.dnsVerifyBody,
		response: {
			200: VerifyModel.dnsVerifyResponse,
			400: VerifyModel.dnsVerifyError,
		},
		detail: {
			tags: ["Verify-DNS-Record"],
			summary: "Verify DNS records",
			description:
				"Verifies DNS records for a domain to check if they are properly configured",
		},
	},
);
