import {
	acmeEmail,
	button,
	fallback,
	footer,
	heading,
	lead,
	link,
	logo,
	step,
	text,
} from "./theme";

export function acmeWelcomeHtml(origin: string): string {
	return acmeEmail({
		title: "Welcome to Acme",
		preview: "Your account is ready. Three steps to your first visit.",
		body: `${logo(origin)}
${heading("Welcome to Acme")}
${lead(`Thanks for joining Acme, <span data-variable="first_name">{{{first_name}}}</span>. Your account is ready, so let's get your first website connected and see where visitors come from and what they do next.`, 32)}
${step(1, "Add your website", "Finish your workspace setup, then add the website you want to measure.")}
${step(2, "Install your tracking script", "Choose your collection and consent settings, then copy the script into your site.")}
${step(3, "See your first visit", "Visit your site and check that events appear. Add custom events when you're ready to measure signups and other actions.")}
${text(`Need a hand? Follow our ${link("#", "setup guide")}.`, { marginBottom: 28 })}
${button("{{{dashboard_url}}}", "Get started")}
${text("You're receiving this email because you created an Acme account.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer()}`,
	});
}
