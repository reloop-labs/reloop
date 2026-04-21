import { redis } from "@be/upload/lib/redis";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.get(
		"/",
		async () => {
			return `
╔════════════════════════════════════════════════════════════════╗
║                        UPLOAD SERVICE                          ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ ██╗   ██╗██████╗ ██╗      ██████╗  █████╗ ██████╗ ███████╗     ║
║ ██║   ██║██╔══██╗██║     ██╔═══██╗██╔══██╗██╔══██╗██╔════╝     ║
║ ██║   ██║██████╔╝██║     ██║   ██║███████║██║  ██║█████╗       ║
║ ██║   ██║██╔═══╝ ██║     ██║   ██║██╔══██║██║  ██║██╔══╝       ║
║ ╚██████╔╝██║     ███████╗╚██████╔╝██║  ██║██████╔╝███████╗     ║
║  ╚═════╝ ╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝     ║
║                                                                ║
║                          ONLINE & READY                        ║
║                         Version: v1.0.0                        ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ 📚 Docs: https://reloop.sh/docs/upload                         ║
║ 🤖 Discovery: https://reloop.sh/api/upload/agent-card.json           ║
║ 📖 OpenAPI: https://reloop.sh/api/upload/openapi                     ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop               ║
║ 🆘 Support: https://reloop.sh/support                          ║
║ 💬 Discord: https://discord.gg/reloop                          ║
║ 🐦 Twitter: https://x.com/reloophq                         ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/upload                  ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  "Store your images locally, serve them globally."             ║
		- Your Reloop Team                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝


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
		name: "Upload Service",
		version: "1.0.0",
		description: "Service for uploading and managing files, images, and attachments.",
		url: "https://reloop.sh",
		defaultInputModes: ["multipart/form-data"],
		defaultOutputModes: ["application/json"],
		supportsStreaming: false,
		skills: [
			{
				id: "upload_file",
				name: "Upload File",
				description: "Upload a file to storage. Returns a public URL or identifier.",
				method: "POST",
				path: "/api/upload/v1/upload",
				tags: ["upload"],
				inputSchema: {
					file: { type: "file", required: true, description: "The file to upload" }
				},
				outputSchema: {
					id: { type: "string" },
					url: { type: "string" }
				},
				errorCodes: [],
				examples: []
			},
			{
				id: "get_file",
				name: "Get File Info",
				description: "Retrieve metadata for a previously uploaded file.",
				method: "GET",
				path: "/api/upload/v1/:id",
				tags: ["upload"],
				inputSchema: {
					id: { type: "string", required: true, description: "File ID" }
				},
				outputSchema: {
					id: { type: "string" },
					name: { type: "string" },
					size: { type: "number" }
				},
				errorCodes: [{ status: 404, meaning: "File not found" }],
				examples: []
			}
		],
		usage_guidelines: "1. Max file size limits apply (default 10MB).\n2. Files are scanned for malware upon upload.\n3. Supported formats: images, documents, and common email attachments.",
		authentication: {
			schemes: ["bearer", "apiKey"],
			headerName: "Authorization",
			notes: "Bearer token or session cookie required."
		},
		provider: {
			organization: "Reloop labs",
			contact: "https://reloop.sh/support"
		}
	}), { detail: { hide: true } },
	);
