import { treaty } from "@elysiajs/eden";
import type { EmailService } from "./types.js";

export const emailServiceClient = treaty<EmailService>("/api/domain");
