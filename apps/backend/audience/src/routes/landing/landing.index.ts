import { Elysia } from "elysia";

export const landing = new Elysia().get("/", () => ({
    message: "Audiences Service API",
    version: "1.0.0",
    status: "running",
}));
