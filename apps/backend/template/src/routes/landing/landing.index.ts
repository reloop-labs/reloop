import { Elysia } from "elysia";

export const landing = new Elysia({ name: "Landing" })
	.get(
		"/",
		() => {
			return `
╔══════════════════════════════════════════════════════════════════════╗
║                        TEMPLATE SERVICE                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║████████╗███████╗███╗   ███╗██████╗ ██╗      █████╗ ████████╗███████╗ ║
║╚══██╔══╝██╔════╝████╗ ████║██╔══██╗██║     ██╔══██╗╚══██╔══╝██╔════╝ ║
║   ██║   █████╗  ██╔████╔██║██████╔╝██║     ███████║   ██║   █████╗   ║
║   ██║   ██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║     ██╔══██║   ██║   ██╔══╝   ║
║   ██║   ███████╗██║ ╚═╝ ██║██║     ███████╗██║  ██║   ██║   ███████╗ ║
║   ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/template                             ║
║ 🤖 Discovery: https://reloop.sh/api/template/agent-card.json         ║
║ 📖 OpenAPI: https://reloop.sh/api/template/openapi                   ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/template                      ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Templates ready for deployment."                                   ║
║               - Your Reloop Team                                     ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
		},
		{
			detail: {
				hide: true
			}
		}
	)
	.get("/agent-card.json", () => ({
		name: "Template Service",
		version: "1.0.0",
		description: "Service for managing email and message templates with support for variables and versioning.",
		url: "https://reloop.sh",
		defaultInputModes: ["application/json"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "health_check",
				name: "Health Check",
				description: "Check the health of the template service.",
				method: "GET",
				path: "/api/template/",
				tags: ["monitoring"],
				inputSchema: {},
				outputSchema: {
					status: { type: "string" },
					service: { type: "string" }
				},
				errorCodes: [],
				examples: []
			},
			{
				id: "create_template",
				name: "Create Template",
				description: "Create a new message template.",
				method: "POST",
				path: "/api/template/v1/",
				tags: ["template"],
				inputSchema: {
					name: { type: "string", required: true, description: "Name of the template" },
					content: { type: "string", required: true, description: "Template content (Handlebars supported)" }
				},
				outputSchema: {
					id: { type: "string" }
				},
				errorCodes: [],
				examples: []
			},
			{
				id: "list_templates",
				name: "List Templates",
				description: "Retrieve all templates for the organization.",
				method: "GET",
				path: "/api/template/v1/list",
				tags: ["template"],
				inputSchema: {},
				outputSchema: {
					templates: { type: "array" }
				},
				errorCodes: [],
				examples: []
			}
		],
		usage_guidelines: "1. Templates support Handlebars syntax for dynamic variable injection.\n2. Templates can be duplicated to create new versions or variations.\n3. Deleting a template is permanent; ensure no active workflows rely on it.",
		authentication: {
			schemes: ["bearer", "cookie"],
			headerName: "Authorization",
			notes: "Bearer token or session cookie required."
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support"
		}
	}));
