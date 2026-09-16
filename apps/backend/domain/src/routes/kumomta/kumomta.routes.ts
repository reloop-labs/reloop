import { Elysia } from "elysia";
import { checkRecipientRoute } from "./check-recipient/check-recipient.route";
import { dkimKeyRoute } from "./dkim-key/dkim-key.route";
import { logIncomingRoute } from "./log-incoming/log-incoming.route";
import { smtpAuthRoute } from "./smtp-auth/smtp-auth.route";
import { storeRawRoute } from "./store-raw/store-raw.route";
import { verifyRoute } from "./verify/verify.route";

export const kumomtaRoutes = new Elysia({ prefix: "", name: "KumomtaRoutes" })
	.use(verifyRoute)
	.use(smtpAuthRoute)
	.use(dkimKeyRoute)
	.use(logIncomingRoute)
	.use(storeRawRoute)
	.use(checkRecipientRoute);
