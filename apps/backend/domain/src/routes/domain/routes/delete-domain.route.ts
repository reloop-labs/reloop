import { Elysia, status, t } from "elysia";
import { authMiddleware } from "../../../middleware/auth";
import { deleteDomainHandler } from "../controllers/delete-domain";
import { DomainModel } from "../domain.model";

export const deleteDomainRoute = new Elysia()
    .use(authMiddleware)
    .delete(
        "/:domain",
        async ({ params: { domain }, user }) => {
            if (!user.activeOrganizationId) {
                throw status(403, {
                    message: "User is not a member of an organization",
                });
            }
            return await deleteDomainHandler(
                domain,
                user.activeOrganizationId,
            );
        },
        {
            auth: true,
            params: t.Object({
                domain: DomainModel.domainParam,
            }),
            response: {
                200: t.Object({ message: t.String() }),
                404: DomainModel.domainNotFound,
                400: DomainModel.invalidDomain,
            },
            detail: {
                tags: ["Domains"],
                summary: "Delete domain",
                description: "Deletes a domain and all its associated data",
            },
        },
    );
