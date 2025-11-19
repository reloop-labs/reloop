import Elysia from "elysia";
import { Inngest, type InngestFunction } from "inngest";
import { serve } from "inngest/bun";

export const client = new Inngest({
    id: "workflow",
    name: "Reloop Workflows",
});

const functions: InngestFunction.Like[] = [];

const handler = serve({ client, functions, });

export const inngestRoutes = new Elysia().all("/v1", ({ request }) =>
    handler(request),
);
