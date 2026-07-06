import { config as aws_ses } from "./aws-ses";
import { config as loops } from "./loops";
import { config as mailchimp } from "./mailchimp";
import { config as mailgun } from "./mailgun";
import { config as postmark } from "./postmark";
import { config as resend } from "./resend";
import { config as sendgrid } from "./sendgrid";

export const alternativeConfigs = [
	resend,
	sendgrid,
	mailgun,
	aws_ses,
	postmark,
	mailchimp,
	loops,
];
