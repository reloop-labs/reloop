import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth";
import { ValidationModel } from "./model";
import { ValidationService } from "./service";

export const validationRoutes = new Elysia({
    prefix: "/validation",
    name: "ValidationRoutes",
})
    .use(authMiddleware)
    .post(
        "/dns",
        async ({ body }) => {
            return await ValidationService.validateDnsRecords(body);
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
                description: "Validates DNS records for a domain to check if they are properly configured",
            },
        },
    );
