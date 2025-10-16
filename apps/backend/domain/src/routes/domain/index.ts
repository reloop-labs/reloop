import { Elysia, status, t } from "elysia";
import { authMiddleware } from "../../middleware/auth";
import { DomainModel } from "./model";
import { DomainService } from "./service";

export const domainRoutes = new Elysia({
    prefix: "/v1",
    name: "DomainRoutes",
})
    .use(authMiddleware)
    .post(
        "/add",
        async ({ body, user }) => {
            if (user.activeOrganizationId) {
                return await DomainService.createDomain(
                    user.activeOrganizationId,
                    user.id,
                    body.domain,
                    body.serverIP || "127.0.0.1"
                );
            }
            throw status(403, "User is not a member of an organization" as const);
        },
        {
            auth: true,
            body: DomainModel.createDomainBody,
            response: {
                201: DomainModel.domainResponse,
                409: DomainModel.domainAlreadyExists,
                400: DomainModel.invalidDomain,
                403: DomainModel.unauthorized,
            },
            detail: {
                tags: ["Domains"],
                summary: "Add a new domain",
                description: "Adds a new domain to the user's organization",
            },
        },
    )

    // Get domain by domain name
    .get(
        "/:domain",
        async ({ params: { domain }, user }) => {
            console.log(`Getting domain for user: ${user.id}`);
            return await DomainService.getDomain(domain);
        },
        {
            auth: true, // Require authentication for this route
            response: {
                200: DomainModel.domainResponse,
                404: DomainModel.domainNotFound,
            },
            detail: {
                tags: ["Domains"],
                summary: "Get domain by name",
                description: "Retrieves a domain by its domain name",
            },
        },
    )
    // Delete domain
    .delete(
        "/:domain",
        async ({ params: { domain }, user }) => {
            console.log(`Deleting domain for user: ${user.id}`);
            await DomainService.deleteDomain(domain);
            return { message: "Domain deleted successfully" };
        },
        {
            auth: true, // Require authentication for this route
            response: {
                200: t.Object({ message: t.String() }),
                404: DomainModel.domainNotFound,
            },
            detail: {
                tags: ["Domains"],
                summary: "Delete domain",
                description: "Deletes a domain and all its associated data",
            },
        },
    )
    .get(
        "/list",
        async ({ query }) => {
            return await DomainService.listDomains(query);
        },
        {
            query: DomainModel.domainQuery,
            response: {
                200: DomainModel.domainListResponse,
            },
            detail: {
                tags: ["Domains"],
                summary: "List domains",
                description:
                    "Retrieves a paginated list of domains with optional filters",
            },
        },
    )
    .get(
        "/search/:term",
        async ({ params: { term }, query }) => {
            return await DomainService.searchDomains(term, query);
        },
        {
            query: t.Object({
                page: t.Optional(t.Number({ minimum: 1, default: 1 })),
                limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
                active: t.Optional(t.Boolean()),
            }),
            response: {
                200: DomainModel.domainListResponse,
            },
            detail: {
                tags: ["Domains"],
                summary: "Search domains",
                description: "Search domains by domain name with pagination",
            },
        },
    )
