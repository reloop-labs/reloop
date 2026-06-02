import { Elysia } from "elysia";

export const landingRoute = new Elysia().get(
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
║ 💬 Discord: https://discord.gg/bHnkBcp7xR                          ║
║ 🐦 Twitter: https://x.com/reloophq                         ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/upload                  ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  "Store your images on S3, serve them globally."              ║
║                - Your Reloop Team                                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
	},
	{ detail: { hide: true } },
);
