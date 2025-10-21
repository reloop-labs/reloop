import { Elysia, status } from "elysia";
import { authMiddleware } from "../../../middleware/auth";
import { createDomainHandler } from "../controllers/create-domain";
import { DomainModel } from "../domain.model";

export const createDomainRoute = new Elysia()
    .use(authMiddleware)
    .post(
        "/add",
        async ({ body, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, {
                    message: "User is not a member of an organization",
                });
            }
            return await createDomainHandler(
                user.activeOrganizationId,
                user.id,
                body,
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
    );
