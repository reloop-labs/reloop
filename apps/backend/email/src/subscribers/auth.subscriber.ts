import { BusEvent, bus } from "@reloop/bus";
import { logger } from "@reloop/logger";
import React from "react";
import OtpEmail from "../../emails/otp";
import SigninDetectedEmail from "../../emails/signin-detected";
import WelcomeEmail from "../../emails/welcome";
import { render } from "../../render";
import { emailConfig } from "../email.config";
import { sendEmail } from "../utils/email";
import { UAParser } from "ua-parser-js";

export async function initAuthSubscribers() {
	// Welcome Email / User Created
	await bus.subscribe(BusEvent.USER_CREATED, async (payload) => {
		try {
			const html = await render(
				React.createElement(WelcomeEmail, {
					fullName: payload.name || "User",
					baseUrl: emailConfig.BASE_URL,
				}),
			);

			await sendEmail({
				from: `Reloop <onboarding@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
				to: payload.email,
				subject: "Welcome to Reloop!",
				html,
			});
		} catch (error) {
			logger.error({ error, payload }, "Failed to send welcome email");
		}
	});

	// OTP Email
	await bus.subscribe(BusEvent.OTP_REQUESTED, async (payload) => {
		console.log(payload, "OTP PAYLOAD");
		try {
			const html = await render(
				React.createElement(OtpEmail, {
					otp: payload.otp,
					email: payload.email,
					baseUrl: emailConfig.BASE_URL,
				}),
			);

			const subject =
				payload.type === "forget-password"
					? `${payload.otp} is your password reset code`
					: payload.type === "email-verification"
						? `${payload.otp} is your email verification code`
						: `${payload.otp} is your Reloop verification code`;
 
			await sendEmail({
				from: `Reloop <auth@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
				to: payload.email,
				subject,
				html,
			});
		} catch (error) {
			logger.error({ error, payload }, "Failed to send OTP email");
		}
	});

	// Signin Detected Email
	await bus.subscribe(BusEvent.SIGNIN_DETECTED, async (payload) => {
		try {
			const parser = new UAParser(payload.browser);
			const ua = parser.getResult();

			const browserName = ua.browser.name || "Unknown Browser";
			const browserVersion = ua.browser.version || "";
			const osName = ua.os.name || "Unknown OS";
			const osVersion = ua.os.version || "";

			const formattedBrowser = `${browserName} ${browserVersion} on ${osName} ${osVersion}`.trim();
			const formattedDevice = ua.device.model || ua.os.name || "Unknown Device";

			const html = await render(
				React.createElement(SigninDetectedEmail, {
					fullName: payload.fullName,
					email: payload.email,
					location: payload.location,
					time: new Date().toLocaleString(),
					browser: formattedBrowser,
					device: formattedDevice,
					ipAddress: payload.ip,
					baseUrl: emailConfig.BASE_URL,
				}),
			);

			await sendEmail({
				from: `Reloop <security@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
				to: payload.email,
				subject: "New sign-in detected on your account",
				html,
			});
		} catch (error) {
			logger.error({ error, payload }, "Failed to send signin detected email");
		}
	});
}
