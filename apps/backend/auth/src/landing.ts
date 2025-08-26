import Elysia from "elysia";

export const landing = new Elysia().get("/", () => {
	return `
╔════════════════════════════════════════════════════════╗
║                     AUTH SERVICE                       ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║           █████╗ ██╗   ██╗████████╗██╗  ██╗            ║
║          ██╔══██╗██║   ██║╚══██╔══╝██║  ██║            ║
║          ███████║██║   ██║   ██║   ███████║            ║
║          ██╔══██║██║   ██║   ██║   ██╔══██║            ║
║          ██║  ██║╚██████╔╝   ██║   ██║  ██║            ║
║          ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝            ║
║                                                        ║
║                  ONLINE & READY                        ║
║                 Version: v1.0.0                        ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║ QUICK START:                                           ║
║ curl -X POST /api/auth/login \                          ║
║   -H "Content-Type: application/json" \                 ║
║   -d '{"email":"dev@reloop.sh","password":"pass"}'     ║
╠════════════════════════════════════════════════════════╣
║ - SUPPORT                                              ║
║ - https://reloop.sh/dev/setup/backend/auth             ║
║ - https://github.com/reloop-labs/reloop                ║
╠════════════════════════════════════════════════════════╣
║  "The best security is invisible security"             ║
║                    - Your Reloop Team                  ║
╚════════════════════════════════════════════════════════╝


    Powered by ☕ Coffee, 🍕 Pizza & 💻 Late Night Coding

                    Made with ❤️ for developers

`;
});
