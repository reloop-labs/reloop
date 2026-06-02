import { Elysia } from "elysia";

export const landingRoute = new Elysia().get(
	"/",
	async () => {
		return `
╔══════════════════════════════════════════════════════════════════════╗
║                        DOMAIN SERVICE                                ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   ██████╗  ██████╗ ███╗   ███╗ █████╗ ██╗███╗   ██╗                  ║
║   ██╔══██╗██╔═══██╗████╗ ████║██╔══██╗██║████╗  ██║                  ║
║   ██║  ██║██║   ██║██╔████╔██║███████║██║██╔██╗ ██║                  ║
║   ██║  ██║██║   ██║██║╚██╔╝██║██╔══██║██║██║╚██╗██║                  ║
║   ██████╔╝╚██████╔╝██║ ╚═╝ ██║██║  ██║██║██║ ╚████║                  ║
║   ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝                  ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/domain                               ║
║ 🤖 Discovery: https://reloop.sh/api/domain/agent-card.json           ║
║ 📖 OpenAPI: https://reloop.sh/api/domain/openapi                     ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/bHnkBcp7xR                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/domain                        ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Verified and ready to serve."                                      ║
║                - Your Reloop Team                                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
	},
	{ detail: { hide: true } },
);
