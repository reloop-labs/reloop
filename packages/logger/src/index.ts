const pino = require("pino");

export const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    ...(process.env.NODE_ENV === "development" && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "hh:mm:ss",
                ignore: "pid,hostname",
                messageFormat: true,
                hideObject: false,
            },
        },
    }),
});

export default logger;
