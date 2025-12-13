import { authMiddleware } from "@be/template/middleware/auth";
import { listTemplates } from "@be/template/routes/template/controllers";
import { t } from "elysia";
import { Elysia } from "elysia";

export const listTemplatesRoute = new Elysia().use(authMiddleware).get(
    "/list",
    async ({ query, user }) => {
        const { activeOrganizationId: organizationId } = user;
        const { page, limit } = query;

        const result = await listTemplates({
            organizationId,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });

        return result;
    },
    {
        auth: true,
        query: t.Object({
            page: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: {
            tags: ["Templates"],
            summary: "List templates",
            description: "Lists all templates for the organization with pagination",
        },
    },
);
