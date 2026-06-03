import { Elysia } from "elysia";

export const landingRoute = new Elysia().get("/", () => {
	return `
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║                          RELOOP INBOX SERVICE                          ║
║                                                                        ║
║  "Every message matters."                                              ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`;
});
