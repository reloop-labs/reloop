import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { bulkImportAudiencesHandler } from "@reloop/audience/routes/audience/controllers/bulk-import-audiences";
import { Elysia, status } from "elysia";

export const bulkImportAudiencesRoute = new Elysia().use(authMiddleware).post(
    "/audience/bulk-import",
    async ({ body, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await bulkImportAudiencesHandler(user.activeOrganizationId, body);
    },
    {
        auth: true,
        body: AudienceModel.bulkImportAudiencesBody,
        response: {
            200: AudienceModel.bulkImportResponse,
            404: AudienceModel.audienceGroupNotFound,
            400: AudienceModel.validationError,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audience"],
            summary: "Bulk import audiences",
            description: "Imports multiple audiences into an audience group at once",
        },
    },
);
