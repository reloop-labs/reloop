import { verifyDomainFunction } from "@be/workflow/functions";
import { inngest } from "@be/workflow/inngest";
import Elysia from "elysia";
import type { InngestFunction } from "inngest";
import { serve } from "inngest/bun";

const functions: InngestFunction.Like[] = [verifyDomainFunction];

const handler = serve({ client: inngest, functions });

export const inngestRoutes = new Elysia().all("/v1", ({ request }) =>
	handler(request),
);
