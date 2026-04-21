import { redis } from "@be/contacts/utils/loader";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        CONTACTS SERVICE                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ██████╗ ██████╗ ███╗  ██╗████████╗ █████╗  ██████╗████████╗███████╗ ║
║ ██╔════╝██╔═══██╗████╗ ██║╚══██╔══╝██╔══██╗██╔════╝╚══██╔══╝██╔════╝ ║
║ ██║     ██║   ██║██╔██╗██║   ██║   ███████║██║        ██║   ███████╗ ║
║ ██║     ██║   ██║██║╚████║   ██║   ██╔══██║██║        ██║   ╚════██║ ║
║ ╚██████╗╚██████╔╝██║ ╚███║   ██║   ██║  ██║╚██████╗   ██║   ███████║ ║
║  ╚═════╝ ╚═════╝ ╚═╝  ╚══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚══════╝ ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/contacts                             ║
║ 🤖 Discovery: https://reloop.sh/api/contacts/agent-card.json          ║
║ 📖 Swagger: https://reloop.sh/api/contacts/swagger                  ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/contacts                      ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Give us your email — we’ll give you applause-worthy updates."      ║
		- Your Reloop Team                                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		},
		{ detail: { hide: true } },
	)
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
		name: "Contacts Service",
		version: "1.0.0",
		description:
			"Service for managing contacts, properties, topics, and groups. Supports automated segmentation and personalized contact tracking.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "health_check",
				name: "Health Check",
				description:
					"Check if the contacts service and its dependencies (Postgres, Redis) are healthy.",
				method: "GET",
				path: "/api/contacts/health",
				tags: ["monitoring"],
				inputSchema: {},
				outputSchema: {
					status: { type: "string", description: "Connection status" },
					success: { type: "boolean", description: "Health status" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "create_contact",
				name: "Create Contact",
				description:
					"Create a new contact in the organization. Call this when you need to add a new person to the contact database.",
				method: "POST",
				path: "/api/contacts/create",
				tags: ["contact"],
				inputSchema: {
					email: {
						type: "string",
						required: true,
						description: "Contact email address",
					},
					firstName: { type: "string", description: "Contact first name" },
					lastName: { type: "string", description: "Contact last name" },
					status: {
						type: "string",
						description: "Subscription status (subscribed, unsubscribed, blocked)",
					},
					properties: {
						type: "object",
						description: "Custom properties as key-value pairs",
					},
				},
				outputSchema: {
					id: { type: "string", description: "Created contact ID" },
					email: { type: "string", description: "Contact email" },
				},
				errorCodes: [
					{ "status": 409, "meaning": "Contact already exists" },
					{ "status": 400, "meaning": "Invalid input data" },
				],
				examples: [],
			},
			{
				id: "retrieve_contact",
				name: "Retrieve Contact",
				description:
					"Fetch a single contact's details by their ID. Use this when you have a contact ID and need their full profile.",
				method: "GET",
				path: "/api/contacts/retrieve/:contact_id",
				tags: ["contact"],
				inputSchema: {
					contact_id: {
						type: "string",
						required: true,
						description: "The unique ID of the contact",
					},
				},
				outputSchema: {
					id: { type: "string", description: "Contact ID" },
					email: { type: "string", description: "Contact email" },
				},
				errorCodes: [{ "status": 404, "meaning": "Contact not found" }],
				examples: [],
			},
			{
				id: "list_contacts",
				name: "List Contacts",
				description:
					"Retrieve a paginated list of contacts with optional filtering and search. Use this for browsing or searching the contact database.",
				method: "GET",
				path: "/api/contacts/list",
				tags: ["contact"],
				inputSchema: {
					page: { type: "number", description: "Page number (default 1)" },
					limit: {
						type: "number",
						description: "Items per page (default 100, max 100)",
					},
					search: { type: "string", description: "Search by email" },
					status: { type: "string", description: "Filter by status" },
				},
				outputSchema: {
					contacts: { type: "array", description: "List of contacts" },
					total: { type: "number", description: "Total number of contacts" },
				},
				errorCodes: [],
				examples: [],
			},
			{
				id: "update_contact",
				name: "Update Contact",
				description:
					"Update an existing contact's information. Use this to change contact details or properties.",
				method: "PATCH",
				path: "/api/contacts/:contact_id",
				tags: ["contact"],
				inputSchema: {
					contact_id: {
						type: "string",
						required: true,
						description: "ID of the contact to update",
					},
					email: { type: "string", description: "New email address" },
					firstName: { type: "string", description: "New first name" },
					lastName: { type: "string", description: "New last name" },
					status: { type: "string", description: "New subscription status" },
				},
				outputSchema: {
					id: { type: "string", description: "Updated contact ID" },
				},
				errorCodes: [{ "status": 404, "meaning": "Contact not found" }],
				examples: [],
			},
			{
				id: "delete_contact",
				name: "Delete Contact",
				description:
					"Permanently remove a contact from the organization. Use this when a contact requests data removal or is no longer needed.",
				method: "DELETE",
				path: "/api/contacts/:contact_id",
				tags: ["contact"],
				inputSchema: {
					contact_id: {
						type: "string",
						required: true,
						description: "ID of the contact to delete",
					},
				},
				outputSchema: {
					success: { type: "boolean", description: "True if deletion succeeded" },
				},
				errorCodes: [{ "status": 404, "meaning": "Contact not found" }],
				examples: [],
			},
		],
		usage_guidelines:
			"1. Use the x-api-key header for API authentication or provide a session cookie.\n2. All contact operations are scoped to an activeOrganizationId.\n3. Valid contact statuses are subscribed, unsubscribed, and blocked.\n4. Properties must have keys matching the pattern ^[a-z0-9_]+$.\n5. Topics use opt_in and opt_out for subscription status.\n6. Pagination for /list uses page and limit query parameters.",
		authentication: {
			schemes: ["apiKey", "bearer"],
			headerName: "x-api-key",
			notes:
				"The Contacts service typically uses x-api-key for programmatic requests.",
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support",
		},
	}));
