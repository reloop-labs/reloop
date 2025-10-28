import { auth } from "@reloop/auth";
import { Elysia } from "elysia";

export const authMiddleware = new Elysia({ name: "authMiddleware" })
    .use(auth)
    .derive(({ headers }) => {
        const authorization = headers.authorization;

        if (!authorization) {
            return {
                user: null,
            };
        }

        const token = authorization.replace("Bearer ", "");

        return {
            user: token,
        };
    });
