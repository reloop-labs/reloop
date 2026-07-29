import { Elysia } from "elysia";
import { dashboardRoute } from "./dashboard/dashboard.route";
import { sendTestEmailRoute } from "./send-test-email/send-test-email.route";

export const onboardingRoute = new Elysia({
	prefix: "/v1",
	name: "OnboardingRoute",
})
	.use(sendTestEmailRoute)
	.use(dashboardRoute);
