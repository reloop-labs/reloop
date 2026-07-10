import { Elysia } from "elysia";

export const landingRoute = new Elysia().get(
	"/",
	async () => {
		return `
╔══════════════════════════════════════════════════════════════════════╗
║                        ADMIN SERVICE                                 ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║         █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗                      ║
║        ██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║                      ║
║        ███████║██║  ██║██╔████╔██║██║██╔██╗ ██║                      ║
║        ██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║                      ║
║        ██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║                      ║
║        ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝                      ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/admin                                ║
║ 🤖 Discovery: https://reloop.sh/api/admin/agent-card.json            ║
║ 📖 OpenAPI: https://reloop.sh/api/admin/swagger                      ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/bHnkBcp7xR                                ║
║ 🐦 Twitter: https://x.com/reloophq                               ║
║ 🛠️ Setup: https://reloop.sh/docs/setup/admin                         ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  "With great power comes great responsibility."                       ║
║                - Your Reloop Team                                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                    Made with ❤️ for developers

`;
	},
	{ detail: { hide: true } },
);
