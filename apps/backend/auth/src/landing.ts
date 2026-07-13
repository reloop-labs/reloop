import { authRedis as redis } from "@reloop/auth/server";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get("/", async () => {
		return `
╔══════════════════════════════════════════════════════════════════════╗
║                        AUTH SERVICE                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║           █████╗ ██╗   ██╗████████╗██╗  ██╗                          ║
║          ██╔══██╗██║   ██║╚══██╔══╝██║  ██║                          ║
║          ███████║██║   ██║   ██║   ███████║                          ║
║          ██╔══██║██║   ██║   ██║   ██╔══██║                          ║
║          ██║  ██║╚██████╔╝   ██║   ██║  ██║                          ║
║          ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝                          ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/auth                                 ║
║ 🤖 Discovery: https://reloop.sh/api/auth/agent-card.json             ║
║ 📖 OpenAPI: https://reloop.sh/api/auth/api/auth/v1/docs              ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/bHnkBcp7xR                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/auth                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "The best security is invisible security"                           ║
║                - Your Reloop Team                                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                    Made with ❤️ for developers

`;
	})
	.get(
		"/health",
		async () => {
			try {
				const startTime = Date.now();
				await redis.healthCheck();
				await db.execute("SELECT 1 as test");
				const responseTime = Date.now() - startTime;

				return {
					status: "CONNECTED",
					success: true,
					responseTime: `${responseTime}ms`,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				return {
					status: "DISCONNECTED",
					success: false,
					error: error instanceof Error ? error.message : String(error),
					timestamp: new Date().toISOString(),
				};
			}
		},
		{ detail: { hide: true } },
	)
	.get("/agent-card.json", () => ({
		name: "Auth Service",
		version: "1.0.0",
		description:
			"Authentication and user management service for Reloop, handling sign-in, sign-up, session management, and organization operations.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "health_check",
				name: "Health Check",
				description:
					"Check if the auth service and its database/cache dependencies are online.",
				method: "GET",
				path: "/api/auth/health",
				tags: ["monitoring"],
				inputSchema: {},
				outputSchema: {
					status: { type: "string" },
					success: { type: "boolean" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "sign_up_email",
				name: "Sign Up with Email",
				description:
					"Register a new user account using email, password, and name.",
				method: "POST",
				path: "/api/auth/v1/sign-up/email",
				tags: ["onboarding"],
				inputSchema: {
					email: { type: "string", required: true },
					password: { type: "string", required: true },
					name: { type: "string", required: true },
				},
				outputSchema: {
					user: { type: "object" },
					session: { type: "object" },
				},
				errorCodes: [{ status: 400, meaning: "Invalid input or user exists" }],
				examples: [],
			},
			{
				id: "sign_in_email",
				name: "Sign In with Email",
				description: "Authenticate an existing user using email and password.",
				method: "POST",
				path: "/api/auth/v1/sign-in/email",
				tags: ["authentication"],
				inputSchema: {
					email: { type: "string", required: true },
					password: { type: "string", required: true },
				},
				outputSchema: {
					user: { type: "object" },
					session: { type: "object" },
				},
				errorCodes: [{ status: 401, meaning: "Invalid credentials" }],
				examples: [],
			},
			{
				id: "create_organization",
				name: "Create Organization",
				description: "Create a new organization for the authenticated user.",
				method: "POST",
				path: "/api/auth/v1/organization/create",
				tags: ["organization"],
				inputSchema: {
					name: { type: "string", required: true },
					slug: { type: "string", required: true },
				},
				outputSchema: {
					id: { type: "string" },
					name: { type: "string" },
				},
				errorCodes: [
					{ status: 401, meaning: "Unauthenticated" },
					{ status: 400, meaning: "Duplicate slug" },
				],
				examples: [],
			},
			{
				id: "invite_member",
				name: "Invite Member",
				description: "Invite a new member to an organization via email.",
				method: "POST",
				path: "/api/auth/v1/organization/invite-member",
				tags: ["organization"],
				inputSchema: {
					email: { type: "string", required: true },
					role: { type: "string", description: "e.g., admin, member" },
				},
				outputSchema: {
					id: { type: "string", description: "Invitation ID" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "list_members",
				name: "List Members",
				description: "List all members of the current organization.",
				method: "GET",
				path: "/api/auth/v1/organization/list-members",
				tags: ["organization"],
				inputSchema: {},
				outputSchema: {
					members: { type: "array" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "remove_member",
				name: "Remove Member",
				description: "Remove a member from the organization.",
				method: "POST",
				path: "/api/auth/v1/organization/remove-member",
				tags: ["organization"],
				inputSchema: {
					memberId: { type: "string", required: true },
				},
				outputSchema: {
					success: { type: "boolean" },
				},
				errorCodes: [],
				examples: [],
			},
		],
		usage_guidelines:
			"1. All auth requests use /api/auth/v1 base path.\n2. Most endpoints require an active session via JWT or cookie.\n3. Organization slugs must be unique.\n4. Invitations are sent via email for user onboarding to teams.",
		authentication: {
			schemes: ["bearer", "cookie"],
			headerName: "Authorization",
			notes: "Better Auth supports both browser cookies and Bearer tokens.",
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support",
		},
	}));
