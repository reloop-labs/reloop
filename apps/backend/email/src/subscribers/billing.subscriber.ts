import { BusEvent, bus } from "@reloop/bus";
import { emailConfig } from "@reloop/email/email.config";
import PaymentFailedEmail from "@reloop/email/emails/payment-failed";
import TrialEndingEmail from "@reloop/email/emails/trial-ending";
import { render, toPlainText } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { log } from "evlog";
import React from "react";

export async function initBillingSubscribers() {
	// Payment Failed
	await bus.subscribe(
		BusEvent.PAYMENT_FAILED,
		async (payload) => {
			try {
				const html = await render(
					React.createElement(PaymentFailedEmail, {
						fullName: "User",
						planName: payload.planName,
						amount: payload.amount,
						failureReason: "Card declined",
						nextRetryDate: new Date(
							Date.now() + 7 * 24 * 60 * 60 * 1000,
						).toLocaleDateString(),
						updateBillingUrl: `${emailConfig.BASE_URL}/dashboard/billing`,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `Reloop Billing <billing@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: "Payment Failed - Action Required",
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send payment failed email",
				});
			}
		},
		{ queue: "billing-email-worker" },
	);

	// Trial Ending
	await bus.subscribe(
		BusEvent.TRIAL_ENDING,
		async (payload) => {
			try {
				const html = await render(
					React.createElement(TrialEndingEmail, {
						fullName: "User",
						daysLeft: payload.daysLeft,
						trialEndDate: new Date(
							Date.now() + payload.daysLeft * 24 * 60 * 60 * 1000,
						).toLocaleDateString(),
						currentPlan: "Pro Trial",
						upgradeUrl: `${emailConfig.BASE_URL}/dashboard/billing/upgrade`,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `Reloop <hello@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: `Your Reloop trial ends in ${payload.daysLeft} days`,
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send trial ending email",
				});
			}
		},
		{ queue: "billing-email-worker" },
	);
}
