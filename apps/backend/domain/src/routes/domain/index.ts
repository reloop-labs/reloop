import { Elysia, status, t } from "elysia";
import { validationRoutes } from "../validation";
import { DomainModel } from "./model";
import { DomainService } from "./service";

export const domainRoutes = new Elysia({
    prefix: "/",
    name: "DomainRoutes",
})
    .post(
        "/",
        async ({ body }) => {
            return await DomainService.createDomain(body);
        },
        {
            body: DomainModel.createDomainBody,
            response: {
                201: DomainModel.domainResponse,
                409: DomainModel.domainAlreadyExists,
                400: DomainModel.invalidDomain,
            },
            detail: {
                tags: ["Domains"],
                summary: "Create a new domain",
                description: "Creates a new domain with the specified configuration",
            },
        },
    )

    // Get domain by domain name
    .get(
        "/:domain",
        async ({ params: { domain } }) => {
            return await DomainService.getDomain(domain);
        },
        {
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

    // Update domain
    .put(
        "/:domain",
        async ({ params: { domain }, body }) => {
            return await DomainService.updateDomain(domain, body);
        },
        {
            body: DomainModel.updateDomainBody,
            response: {
                200: DomainModel.domainResponse,
                404: DomainModel.domainNotFound,
                400: DomainModel.invalidDomain,
            },
            detail: {
                tags: ["Domains"],
                summary: "Update domain",
                description: "Updates an existing domain configuration",
            },
        },
    )

    // Delete domain
    .delete(
        "/:domain",
        async ({ params: { domain } }) => {
            await DomainService.deleteDomain(domain);
            return { message: "Domain deleted successfully" };
        },
        {
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

    // List domains with pagination and filters
    .get(
        "/",
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

    // Search domains
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

    // Check if domain exists
    .head(
        "/:domain",
        async ({ params: { domain } }) => {
            const exists = await DomainService.domainExists(domain);
            if (!exists) {
                throw status(404, "Domain not found" as const);
            }
            return;
        },
        {
            response: {
                200: t.Void(),
                404: DomainModel.domainNotFound,
            },
            detail: {
                tags: ["Domains"],
                summary: "Check domain existence",
                description: "Checks if a domain exists without returning its data",
            },
        },
    )

    // Include validation routes
    .use(validationRoutes);
