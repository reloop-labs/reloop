import { openapi } from "@reloop/fe-docs/lib/openapi";
import { codeUsages } from "@reloop/fe-docs/lib/openapi/code-usage";
import { createAPIPage } from "fumadocs-openapi/ui";
import client from "./api-page.client";

export const APIPage = createAPIPage(openapi, {
	client,
	codeUsages,
});
