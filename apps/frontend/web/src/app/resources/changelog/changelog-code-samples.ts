export const changelogCodeByVersion: Record<string, string> = {
	"0.9.0":
		"// Send from the new SDK after onboarding\nimport Reloop from 'reloop-email';\n\nconst reloop = new Reloop(process.env.RELOOP_API_KEY);\nawait reloop.emails.send({\n  to: 'user@example.com',\n  subject: 'Hello from Reloop',\n  html: '<p>Your agent inbox is live.</p>',\n});",
	"0.4.0":
		"npm install reloop-email\n\nimport Reloop from 'reloop-email';\nconst reloop = new Reloop('rl_live_...');\nawait reloop.emails.send({ ... });",
	"0.1.0":
		"import Reloop from 'reloop-email';\n\nconst reloop = new Reloop('rl_live_...');\nawait reloop.emails.send({\n  to: 'user@example.com',\n  subject: 'Welcome',\n  html: '<p>Hello from Reloop.</p>',\n});",
};
