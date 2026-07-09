import { Elysia } from "elysia";

export const landingRoute = new Elysia().get(
	"/",
	async () => {
		return `
╔══════════════════════════════════════════════════════════════════════╗
║                            ADMIN SERVICE                             ║
╠══════════════════════════════════════════════════════════════════════╣
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
╚══════════════════════════════════════════════════════════════════════╝
`;
	},
	{ detail: { hide: true } },
);
