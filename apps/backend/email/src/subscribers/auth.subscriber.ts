import { BusEvent, bus } from "@reloop/bus";
import { emailConfig } from "@reloop/email/email.config";
import OtpEmail from "@reloop/email/emails/otp";
import SigninDetectedEmail from "@reloop/email/emails/signin-detected";
import WelcomeEmail from "@reloop/email/emails/welcome";
import { redis } from "@reloop/email/lib/redis";
import { render, toPlainText } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { log } from "evlog";
import React from "react";
import { UAParser } from "ua-parser-js";

export async function initAuthSubscribers() {
	// Welcome Email / User Created

	await bus.subscribe(
		BusEvent.USER_CREATED,
		async (payload) => {
			const dedupKey = `email:welcome:${payload.email}`;
			try {
				const alreadySent = await redis.get(dedupKey);
				if (alreadySent) {
					log.warn(
						"server",
						`Duplicate USER_CREATED for ${payload.email}, skipping`,
					);
					return;
				}
				await redis.set(dedupKey, "1", 60);

				const html = await render(
					React.createElement(WelcomeEmail, {
						fullName: payload.name || "User",
						baseUrl: emailConfig.BASE_URL,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `Reloop <onboarding@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: "Welcome to Reloop!",
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send welcome email",
				});
			}
		},
		{ queue: "auth-email-worker" },
	);

	// OTP Email
	await bus.subscribe(
		BusEvent.OTP_REQUESTED,
		async (payload) => {
			// Dedup OTP by email and OTP value to avoid double sends for the same request
			const dedupKey = `email:otp:${payload.email}:${payload.otp}`;
			try {
				const alreadySent = await redis.get(dedupKey);
				if (alreadySent) {
					log.warn(
						"server",
						`Duplicate OTP_REQUESTED for ${payload.email}, skipping`,
					);
					return;
				}
				await redis.set(dedupKey, "1", 60);

				console.log(payload, "OTP PAYLOAD");
				const html = await render(
					React.createElement(OtpEmail, {
						otp: payload.otp,
						email: payload.email,
						baseUrl: emailConfig.BASE_URL,
					}),
				);

				const text = toPlainText(html);

				const subject =
					payload.type === "forget-password"
						? "Your password reset code"
						: payload.type === "email-verification"
							? "Your email verification code"
							: "Your Reloop verification code";

				await sendEmail({
					from: `Reloop <auth@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject,
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send OTP email",
				});
			}
		},
		{ queue: "auth-email-worker" },
	);

	// Signin Detected Email
	await bus.subscribe(
		BusEvent.SIGNIN_DETECTED,
		async (payload) => {
			// Dedup by email and a small window to avoid bursts from Better Auth hooks
			const dedupKey = `email:signin:${payload.email}`;
			try {
				const alreadySent = await redis.get(dedupKey);
				if (alreadySent) {
					log.warn(
						"server",
						`Duplicate SIGNIN_DETECTED for ${payload.email}, skipping`,
					);
					return;
				}
				await redis.set(dedupKey, "1", 60);

				const parser = new UAParser(payload.browser);
				const ua = parser.getResult();

				const browserName = ua.browser.name || "Unknown Browser";
				const browserVersion = ua.browser.version || "";
				const osName = ua.os.name || "Unknown OS";
				const osVersion = ua.os.version || "";

				const formattedBrowser =
					`${browserName} ${browserVersion} on ${osName} ${osVersion}`.trim();
				const formattedDevice =
					ua.device.model || ua.os.name || "Unknown Device";

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

				const text = toPlainText(html);

				await sendEmail({
					from: `Security Alert <security@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: "New sign-in detected on your account",
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send signin detected email",
				});
			}
		},
		{ queue: "auth-email-worker" },
	);
}
