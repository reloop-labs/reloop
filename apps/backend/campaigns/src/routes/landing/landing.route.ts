import { Elysia } from "elysia";

export const landingRoute = new Elysia().get("/", () => {
	return `
Campaigns Service
https://reloop.sh/api/campaigns
OpenAPI: https://reloop.sh/api/campaigns/openapi
`;
});
