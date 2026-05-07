import { BusEvent, bus } from "@reloop/bus";
import { logger } from "@reloop/logger";
import React from "react";
import OtpEmail from "../../emails/otp";
import SigninDetectedEmail from "../../emails/signin-detected";
import WelcomeEmail from "../../emails/welcome";
import { render } from "../../render";
import { emailConfig } from "../email.config";
import { sendEmail } from "../utils/email";

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

			await sendEmail({
				from: `Reloop <auth@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
				to: payload.email,
				subject: `${payload.otp} is your Reloop verification code`,
				html,
			});
		} catch (error) {
			logger.error({ error, payload }, "Failed to send OTP email");
		}
	});

	// Signin Detected Email
	await bus.subscribe(BusEvent.SIGNIN_DETECTED, async (payload) => {
		try {
			const html = await render(
				React.createElement(SigninDetectedEmail, {
					fullName: "User",
					email: payload.email,
					location: payload.location,
					time: new Date().toLocaleString(),
					browser: payload.browser,
					device: payload.os, // Using os as device for now
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
