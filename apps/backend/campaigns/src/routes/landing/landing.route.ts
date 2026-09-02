import { Elysia } from "elysia";

export const landingRoute = new Elysia().get(
	"/",
	() => {
		return `
╔══════════════════════════════════════════════════════════════════════╗
║                        CAMPAIGNS SERVICE                             ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ██████╗ █████╗ ███╗ ███╗██████╗ █████╗ ██╗ ██████╗ ███╗ ██╗███████╗ ║
║ ██╔════╝██╔══██╗████████║██╔══██╗██╔══██╗██║██╔════╝███████║██╔════╝ ║
║ ██║     ███████║██╔█╔╝██║██████╔╝███████║██║██║  ███╗██╔███║███████╗ ║
║ ██║     ██╔══██║██║╚═╝██║██╔═══╝ ██╔══██║██║██║   ██║██║╚██║╚════██║ ║
║ ╚██████╗██║  ██║██║   ██║██║     ██║  ██║██║╚██████╔╝██║ ╚█║███████║ ║
║  ╚═════╝╚═╝  ╚═╝╚═╝   ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚╝╚══════╝ ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/campaigns                            ║
║ 🤖 Discovery: https://reloop.sh/api/campaigns/agent-card.json        ║
║ 📖 OpenAPI: https://reloop.sh/api/campaigns/openapi                  ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/bHnkBcp7xR                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/backend/campaigns             ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Reach your audience with precision at scale."                      ║
║                - Your Reloop Team                                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
	},
	{
		detail: {
			hide: true,
		},
	},
);

