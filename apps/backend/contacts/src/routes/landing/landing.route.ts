import { Elysia } from "elysia";

export const landingRoute = new Elysia().get(
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
║ 🤖 Discovery: https://reloop.sh/api/contacts/agent-card.json         ║
║ 📖 OpenAPI: https://reloop.sh/api/contacts/openapi                   ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://x.com/reloophq                                   ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/contacts                      ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "Give us your email — we’ll give you applause-worthy updates."      ║
║                - Your Reloop Team                                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                Made with ❤️ for developers

`;
	},
	{ detail: { hide: true } },
);
