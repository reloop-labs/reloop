import { log } from "evlog";
import { BusEvent, bus } from "@reloop/bus";

import { render } from "../../render";
import { emailConfig } from "../email.config";
import { sendEmail } from "../utils/email";
import PaymentFailedEmail from "../../emails/payment-failed";
import QuotaWarningEmail from "../../emails/quota-warning";
import TrialEndingEmail from "../../emails/trial-ending";
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

				await sendEmail({
					from: `Reloop Billing <billing@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: "Payment Failed - Action Required",
					html,
				});
			} catch (error) {
				log.error({ ...({ error, payload }), message: "Failed to send payment failed email" });
			}
		},
		{ queue: "billing-email-worker" },
	);

	// Quota Warning
	await bus.subscribe(
		BusEvent.QUOTA_WARNING,
		async (payload) => {
			try {
				const html = await render(
					React.createElement(QuotaWarningEmail, {
						fullName: "User",
						percentUsed: payload.percentage,
						emailsSent: 8000,
						emailsLimit: 10000,
						resetDate: "Next Month",
						upgradeUrl: `${emailConfig.BASE_URL}/dashboard/billing/upgrade`,
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard`,
					}),
				);

				await sendEmail({
					from: `Reloop Support <support@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: `Usage Alert: ${payload.percentage}% of your ${payload.resourceType} quota used`,
					html,
				});
			} catch (error) {
				log.error({ ...({ error, payload }), message: "Failed to send quota warning email" });
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

				await sendEmail({
					from: `Reloop <hello@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: `Your Reloop trial ends in ${payload.daysLeft} days`,
					html,
				});
			} catch (error) {
				log.error({ ...({ error, payload }), message: "Failed to send trial ending email" });
			}
		},
		{ queue: "billing-email-worker" },
	);
}
