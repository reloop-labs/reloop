import { Elysia } from "elysia";

export const landingRoute = new Elysia().get(
	"/",
	async () => {
		return `
╔══════════════════════════════════════════════════════════════════════╗
║                        API KEY SERVICE                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║    █████╗ ██████╗ ██╗    ██╗  ██╗███████╗██╗   ██╗                   ║
║   ██╔══██╗██╔══██╗██║    ██║ ██╔╝██╔════╝╚██╗ ██╔╝                   ║
║   ███████║██████╔╝██║    █████╔╝ █████╗   ╚████╔╝                    ║
║   ██╔══██║██╔═══╝ ██║    ██╔═██╗ ██╔══╝    ╚██╔╝                     ║
║   ██║  ██║██║     ██║    ██║  ██╗███████╗   ██║                      ║
║   ╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝  ╚═╝╚══════╝   ╚═╝                      ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/api-key                             ║
║ 🤖 Discovery: https://reloop.sh/api/api-key/agent-card.json          ║
║ 📖 OpenAPI: https://reloop.sh/api/api-key/openapi                    ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/api-key                      ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Lock it down, like a pro."                                         ║
║                - Your Reloop Team                                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
	},
	{ detail: { hide: true } },
);
