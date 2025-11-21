import {
	helloWorldFunction,
	inngest,
	verifyDomainFunction,
} from "@be/workflow/functions";
import Elysia from "elysia";
import type { InngestFunction } from "inngest";
import { serve } from "inngest/bun";

const functions: InngestFunction.Like[] = [
	helloWorldFunction,
	verifyDomainFunction,
];

const handler = serve({ client: inngest, functions });

export const inngestRoutes = new Elysia().all("/v1", ({ request }) =>
	handler(request),
);
