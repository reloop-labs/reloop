import { Elysia } from "elysia";

export const landingRoute = new Elysia().get(
	"/",
	async () => {
		return `
╔══════════════════════════════════════════════════════════════════════╗
║                            TOOLS SERVICE                             ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ████████╗ ██████╗  ██████╗ ██╗     ███████╗                         ║
║  ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝                         ║
║     ██║   ██║   ██║██║   ██║██║     ███████╗                         ║
║     ██║   ██║   ██║██║   ██║██║     ╚════██║                         ║
║     ██║   ╚██████╔╝╚██████╔╝███████╗███████║                         ║
║     ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝                         ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/setup/backend/tools                  ║
║ 🤖 Discovery: https://reloop.sh/api/tools/agent-card.json            ║
║ 📖 OpenAPI: https://reloop.sh/api/tools/openapi                      ║
║ 🧪 Try it: https://reloop.sh/tools/temp-email-checker                ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/bHnkBcp7xR                            ║
║ 🐦 Twitter: https://x.com/reloophq                                   ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Checked and discarded — nothing kept."                             ║
║                - Your Reloop Team                                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
	},
	{ detail: { hide: true } },
);
