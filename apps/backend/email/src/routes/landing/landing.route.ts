import { Elysia } from "elysia";

export const landingRoute = new Elysia().get(
	"/",
	async () => {
		return `
╔══════════════════════════════════════════════════════════════════════╗
║                          EMAIL SERVICE                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║    ███████╗███╗   ███╗ █████╗ ██╗██╗                                 ║
║    ██╔════╝████╗ ████║██╔══██╗██║██║                                 ║
║    █████╗  ██╔████╔██║███████║██║██║                                 ║
║    ██╔══╝  ██║╚██╔╝██║██╔══██║██║██║                                 ║
║    ███████╗██║ ╚═╝ ██║██║  ██║██║███████╗                            ║
║    ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝                            ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/email                                ║
║ 🤖 Discovery: https://reloop.sh/api/email/agent-card.json            ║
║ 📖 OpenAPI: https://reloop.sh/api/email/openapi                      ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/bHnkBcp7xR                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/email                        ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Inbox zero is just a dream, let's make it a reality."              ║
║                - Your Reloop Team                                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
	},
	{ detail: { hide: true } },
);
