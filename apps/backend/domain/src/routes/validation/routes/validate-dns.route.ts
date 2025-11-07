import { authMiddleware } from "@be/domain/middleware/auth";
import { validateDnsRecordsHandler } from "@be/domain/routes/validation/controllers/validate-dns-records";
import { ValidationModel } from "@be/domain/routes/validation/validation.model";
import { Elysia } from "elysia";

export const validateDnsRoute = new Elysia().use(authMiddleware).post(
	"/dns",
	async ({ body }) => {
		return await validateDnsRecordsHandler(body);
	},
	{
		body: ValidationModel.dnsValidationBody,
		response: {
			200: ValidationModel.dnsValidationResponse,
			400: ValidationModel.dnsValidationError,
		},
		detail: {
			tags: ["Validation"],
			summary: "Validate DNS records",
			description:
				"Validates DNS records for a domain to check if they are properly configured",
		},
	},
);
