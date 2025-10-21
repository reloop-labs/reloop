import { Elysia, t } from "elysia";
import { authMiddleware } from "../../../middleware/auth";
import { getDomainHandler } from "../controllers/get-domain";
import { DomainModel } from "../domain.model";

export const getDomainRoute = new Elysia()
    .use(authMiddleware)
    .get(
        "/:domain",
        async ({ params: { domain } }) => {
            return await getDomainHandler(domain);
        },
        {
            auth: true,
            params: t.Object({
                domain: DomainModel.domainParam,
            }),
            response: {
                200: DomainModel.domainResponse,
                404: DomainModel.domainNotFound,
                400: DomainModel.invalidDomain,
            },
            detail: {
                tags: ["Domains"],
                summary: "Get domain by name",
                description: "Retrieves a domain by its domain name",
            },
        },
    );
