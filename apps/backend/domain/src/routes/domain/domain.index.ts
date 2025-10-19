import { Elysia, status, t } from "elysia";
import { authMiddleware } from "../../middleware/auth";
import { DomainModel } from "./domain.model";
import { DomainServiceHandler } from "./domain.service";

export const domainRoutes = new Elysia({
    prefix: "/v1",
    name: "DomainRoutes",
})
    .use(authMiddleware)
    .post(
        "/add",
        async ({ body, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, { message: "User is not a member of an organization" });
            }
            return await DomainServiceHandler.createDomain(
                user.activeOrganizationId,
                user.id,
                body
            );
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
    .get(
        "/:domain",
        async ({ params: { domain } }) => {
            return await DomainServiceHandler.getDomain(domain);
        },
        {
            auth: true,
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
    .delete(
        "/:domain",
        async ({ params: { domain } }) => {
            return await DomainServiceHandler.deleteDomain(domain);
        },
        {
            auth: true,
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
            return await DomainServiceHandler.listDomains(query);
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
