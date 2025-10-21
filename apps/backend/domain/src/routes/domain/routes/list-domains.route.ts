import { Elysia, status } from "elysia";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { listDomainsHandler } from "@reloop/domain/routes/domain/controllers/list-domains";
import { DomainModel } from "@reloop/domain/routes/domain/domain.model";

export const listDomainsRoute = new Elysia()
    .use(authMiddleware)
    .get(
        "/list",
        async ({ query, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, {
                    message: "User is not a member of an organization",
                });
            }
            return await listDomainsHandler(
                query,
                user.activeOrganizationId,
                user.id,
            );
        },
        {
            query: DomainModel.domainQuery,
            response: {
                200: DomainModel.domainListResponse,
                403: DomainModel.unauthorized,
            },
            auth: true,
            detail: {
                tags: ["Domains"],
                summary: "List domains",
                description:
                    "Retrieves a paginated list of domains with optional filters",
            },
        },
    );
