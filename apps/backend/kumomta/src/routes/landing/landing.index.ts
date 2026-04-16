import { redis } from "@reloop/be-kumomta/utils/loader";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const landing = new Elysia()
  .get(
    "/",
    async () => {
      let dbStatus = "UNKNOWN";
      let redisStatus = "UNKNOWN";

      try {
        await db.execute("SELECT 1 as test");
        dbStatus = "CONNECTED";
      } catch {
        dbStatus = "DISCONNECTED";
      }

      try {
        await redis.healthCheck();
        redisStatus = "CONNECTED";
      } catch {
        redisStatus = "DISCONNECTED";
      }

      const dbStatusEmoji = dbStatus === "CONNECTED" ? "✅" : "❌";
      const redisStatusEmoji = redisStatus === "CONNECTED" ? "✅" : "❌";

      return `
╔══════════════════════════════════════════════════════════════════════╗
║                        KUMOMTA SERVICE                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ██╗  ██╗██╗   ██╗███╗   ███╗ ██████╗ ███╗   ███╗████████╗ █████╗    ║
║  ██║ ██╔╝██║   ██║████╗ ████║██╔═══██╗████╗ ████║╚══██╔══╝██╔══██╗   ║
║  █████╔╝ ██║   ██║██╔████╔██║██║   ██║██╔████╔██║   ██║   ███████║   ║
║  ██╔═██╗ ██║   ██║██║╚██╔╝██║██║   ██║██║╚██╔╝██║   ██║   ██╔══██║   ║
║  ██║  ██╗╚██████╔╝██║ ╚═╝ ██║╚██████╔╝██║ ╚═╝ ██║   ██║   ██║  ██║   ║
║  ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝ ╚═════╝ ╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═╝   ║
║                                                                      ║
║                          ONLINE & READY                              ║
║                         Version: v1.0.0                              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 🗄️ DATABASE STATUS: ${dbStatusEmoji}                                               ║
║ 🛢️ REDIS STATUS: ${redisStatusEmoji}                                                  ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 📚 Docs: https://reloop.sh/docs/kumomta                              ║
║ 🐙 GitHub: https://github.com/reloop-labs/reloop                     ║
║ 🆘 Support: https://reloop.sh/support                                ║
║ 💬 Discord: https://discord.gg/reloop                                ║
║ 🐦 Twitter: https://twitter.com/reloop                               ║
║ 🛠️ Setup: https://reloop.sh/dev/setup/kumomta                        ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║                                                                      ║
║  "Fasten your seatbelts, KumoMTA handles the heavy lifting."         ║
║                    - Your Reloop Team                                ║
║                                                                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝


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
  );
