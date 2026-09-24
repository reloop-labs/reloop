process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const API_KEY =
	process.env.RELOOP_API_KEY || "rl_prod_1lqmLSpV3ryAN3x_g-d2V90Nrtk";
const BASE_URL = process.env.RELOOP_BASE_URL || "https://local.reloop.sh";

interface DemoEmail {
	from: string;
	to: string | string[];
	subject: string;
	tags?: { name: string; value: string }[];
	text: string;
	html: string;
}

const demoEmails: DemoEmail[] = [
	{
		from: "Linear <notifications@local.reloop.sh>",
		to: "karri.saarinen@linear.app",
		subject: '[Linear] Assigned: "Reduce P99 API latency below 45ms" (LIN-1240)',
		tags: [
			{ name: "category", value: "notifications" },
			{ name: "service", value: "linear" },
		],
		text: 'Karri Saarinen assigned LIN-1240 ("Reduce P99 API latency below 45ms") to you. Priority: Urgent.',
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #0d0e11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e6e8eb;">
  <div style="max-width: 580px; margin: 40px auto; background: #16181d; border-radius: 12px; border: 1px solid #282b33; overflow: hidden;">
    <div style="padding: 22px 28px; border-bottom: 1px solid #23262e; display: flex; align-items: center;">
      <span style="font-weight: 600; font-size: 15px; color: #f0f2f5;">Linear Issue Assigned</span>
    </div>
    <div style="padding: 28px;">
      <div style="margin-bottom: 14px;">
        <span style="background: rgba(235, 87, 87, 0.15); color: #f26666; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 4px;">URGENT</span>
        <span style="color: #8a8f98; font-size: 13px; margin-left: 8px;">LIN-1240</span>
      </div>
      <h2 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 14px 0;">Reduce P99 API latency below 45ms</h2>
      <p style="color: #9da3ae; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        <strong style="color: #e6e8eb;">Karri Saarinen</strong> assigned this issue to you in <strong style="color: #e6e8eb;">Core Engine</strong>.
      </p>
      <div style="background: #1e2129; border-radius: 8px; padding: 16px; border-left: 3px solid #5e6ad2; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13.5px; color: #c2c7d0; line-height: 1.5;">
          "The query plan optimization on the secondary replication pool dropped latency by 20%, but P99 tail spikes remain during webhook retries."
        </p>
      </div>
      <a href="https://local.reloop.sh" style="display: inline-block; background: #5e6ad2; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-size: 13px; font-weight: 500;">Open in Linear</a>
    </div>
    <div style="padding: 16px 28px; background: #111216; border-top: 1px solid #23262e; font-size: 12px; color: #626773;">
      Linear App, Inc. • Notification preferences available in settings
    </div>
  </div>
</body>
</html>`,
	},
	{
		from: "Vercel Deployments <deployments@local.reloop.sh>",
		to: "guillermo.rauch@vercel.com",
		subject: "Production deployment ready: frontend-core (dpl_9a2f7c)",
		tags: [
			{ name: "category", value: "ci-cd" },
			{ name: "service", value: "vercel" },
		],
		text: "Production deployment dpl_9a2f7c for frontend-core completed successfully in 32s. Ready to serve traffic globally.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ededed;">
  <div style="max-width: 560px; margin: 40px auto; background: #0a0a0a; border: 1px solid #222222; border-radius: 12px; padding: 36px 32px;">
    <div style="display: inline-block; padding: 4px 10px; background: rgba(0, 112, 243, 0.12); border: 1px solid rgba(0, 112, 243, 0.3); border-radius: 20px; font-size: 12px; color: #0070f3; font-weight: 500; margin-bottom: 16px;">
      Production Deployed
    </div>
    <h1 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 16px 0;">
      frontend-core is now live
    </h1>
    <p style="font-size: 14px; color: #888888; line-height: 1.6; margin: 0 0 24px 0;">
      Commit <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #fff;">38acb9e</code> by <strong>@pranav</strong> was built and deployed to Vercel's global edge network in 32s.
    </p>
    <div style="background: #111111; border: 1px solid #222222; border-radius: 8px; padding: 18px; margin-bottom: 28px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 13px; color: #666666;">Deployment</span>
        <span style="font-size: 13px; color: #ffffff; font-family: monospace;">dpl_9a2f7c001</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 13px; color: #666666;">Domain</span>
        <span style="font-size: 13px; color: #0070f3; font-family: monospace;">reloop.sh</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="font-size: 13px; color: #666666;">Build Time</span>
        <span style="font-size: 13px; color: #ffffff;">32 seconds</span>
      </div>
    </div>
    <a href="https://local.reloop.sh" style="display: inline-block; background: #ffffff; color: #000000; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-weight: 600; font-size: 13px;">View Deployment</a>
  </div>
</body>
</html>`,
	},
	{
		from: "OpenAI Platform <platform@local.reloop.sh>",
		to: "sam.altman@openai.com",
		subject: "Monthly API Usage Statement — August 2026 ($1,840.50)",
		tags: [
			{ name: "category", value: "billing" },
			{ name: "service", value: "openai" },
		],
		text: "Your monthly API billing statement is available for August 2026. Total usage across GPT-4o and o1-preview models: $1,840.50 USD.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #202123;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 32px;">
    <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0; color: #10a37f;">OpenAI Platform</h2>
    <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px 0; color: #202123;">Monthly Usage Invoice</h1>
    <p style="font-size: 14px; line-height: 1.5; color: #6e6e80; margin: 0 0 24px 0;">
      Here is your API token consumption summary for August 1 – August 31, 2026.
    </p>
    <div style="background: #f7f7f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-size: 14px; color: #6e6e80;">GPT-4o Reasoning (Tokens)</span>
        <span style="font-size: 14px; font-weight: 500;">$1,120.20</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-size: 14px; color: #6e6e80;">o1-preview (Tokens)</span>
        <span style="font-size: 14px; font-weight: 500;">$540.30</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #e5e5e5;">
        <span style="font-size: 15px; font-weight: 600;">Total Billed</span>
        <span style="font-size: 16px; font-weight: 700; color: #10a37f;">$1,840.50 USD</span>
      </div>
    </div>
    <a href="https://local.reloop.sh" style="background: #10a37f; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 500; display: inline-block;">View Usage Details</a>
  </div>
</body>
</html>`,
	},
	{
		from: "Supabase Cloud <team@local.reloop.sh>",
		to: "paul.copplestone@supabase.io",
		subject: "Database cluster snapshot completed: pg-cluster-prod-us-east-1",
		tags: [
			{ name: "category", value: "infrastructure" },
			{ name: "service", value: "supabase" },
		],
		text: "Automated daily WAL-G snapshot for pg-cluster-prod-us-east-1 completed in 4m 12s. Integrity check: Passed.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #1c1c1c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ededed;">
  <div style="max-width: 560px; margin: 40px auto; background: #242424; border: 1px solid #333333; border-radius: 10px; padding: 32px;">
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <span style="color: #3ecf8e; font-weight: 700; font-size: 18px;">⚡ Supabase Cloud</span>
    </div>
    <div style="display: inline-block; padding: 3px 10px; background: rgba(62, 207, 142, 0.15); border: 1px solid rgba(62, 207, 142, 0.3); border-radius: 12px; font-size: 12px; color: #3ecf8e; font-weight: 600; margin-bottom: 14px;">
      Snapshot Complete
    </div>
    <h2 style="font-size: 18px; margin: 0 0 14px 0; color: #ffffff;">Cluster Snapshot Verified</h2>
    <p style="font-size: 14px; color: #999999; line-height: 1.5; margin: 0 0 20px 0;">
      The daily automated physical backup for <strong>prod-cluster-01</strong> finished with zero anomalies.
    </p>
    <div style="background: #1c1c1c; border-radius: 6px; padding: 14px; font-size: 13px; color: #ccc; margin-bottom: 24px;">
      <p style="margin: 0 0 6px 0;"><strong>Size:</strong> 42.8 GB (compressed)</p>
      <p style="margin: 0 0 6px 0;"><strong>Duration:</strong> 4 mins 12 secs</p>
      <p style="margin: 0;"><strong>Integrity:</strong> Verified (SHA-256 ok)</p>
    </div>
    <a href="https://local.reloop.sh" style="background: #3ecf8e; color: #1c1c1c; text-decoration: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">Manage Backups</a>
  </div>
</body>
</html>`,
	},
	{
		from: "Figma Team <notifications@local.reloop.sh>",
		to: "dylan.field@figma.com",
		subject: 'Rasmus Andersson commented on "Reloop Design System v2"',
		tags: [
			{ name: "category", value: "design" },
			{ name: "service", value: "figma" },
		],
		text: 'Rasmus Andersson commented on Frame "Component / Button / Primary": "The focus ring contrast on dark mode looks super crisp!"',
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e1e1e;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 32px;">
    <div style="margin-bottom: 20px;">
      <span style="font-weight: 700; font-size: 18px; letter-spacing: -0.5px;">Figma</span>
    </div>
    <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">New Comment in Reloop Design System v2</h3>
    <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start;">
      <div style="width: 36px; height: 36px; border-radius: 18px; background: #0c8ce9; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; text-align: center; line-height: 36px;">
        RA
      </div>
      <div>
        <strong style="font-size: 14px;">Rasmus Andersson</strong>
        <p style="font-size: 14px; color: #444; margin: 4px 0 0 0; line-height: 1.5;">
          "The focus ring contrast on dark mode looks super crisp! Let's ship this token set to production."
        </p>
      </div>
    </div>
    <a href="https://local.reloop.sh" style="background: #0c8ce9; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 500; display: inline-block;">Reply in Figma</a>
  </div>
</body>
</html>`,
	},
	{
		from: "Shopify Orders <orders@local.reloop.sh>",
		to: "tobi.lutke@shopify.com",
		subject: "New order #SH-9042 received: Framework 16 Laptop ($2,199.00)",
		tags: [
			{ name: "category", value: "ecommerce" },
			{ name: "service", value: "shopify" },
		],
		text: "You have a new paid order #SH-9042 for $2,199.00 USD. Customer: Marcus Aurelius.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #f1f2f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #202223;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; border: 1px solid #e1e3e5; padding: 32px;">
    <div style="margin-bottom: 24px;">
      <span style="color: #008060; font-weight: 700; font-size: 18px;">🛍️ Shopify Store</span>
    </div>
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">Order #SH-9042 confirmed</h2>
    <p style="font-size: 14px; color: #6d7175; margin: 0 0 24px 0;">Customer: Marcus Aurelius • Total: $2,199.00 USD</p>
    <div style="border-top: 1px solid #e1e3e5; padding: 16px 0;">
      <div style="display: flex; justify-content: space-between;">
        <span style="font-weight: 500; font-size: 14px;">Framework 16 Laptop (DIY Edition, AMD Ryzen 7)</span>
        <span style="font-weight: 600; font-size: 14px;">$2,199.00</span>
      </div>
    </div>
    <div style="margin-top: 24px;">
      <a href="https://local.reloop.sh" style="background: #008060; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; display: inline-block;">Fulfill in Admin</a>
    </div>
  </div>
</body>
</html>`,
	},
	{
		from: "GitHub Actions <notifications@local.reloop.sh>",
		to: "nat.friedman@github.com",
		subject: "[reloop-labs/reloop] Run passed: CI / End-to-End Suite (#482)",
		tags: [
			{ name: "category", value: "ci-cd" },
			{ name: "service", value: "github" },
		],
		text: "GitHub Actions: All 42 checks passed on main for commit 7c98e21 (PR #482). Ready to merge.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #c9d1d9;">
  <div style="max-width: 580px; margin: 40px auto; background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden;">
    <div style="padding: 20px 24px; border-bottom: 1px solid #30363d; background: #21262d;">
      <strong style="color: #f0f6fc; font-size: 16px;">GitHub Actions</strong>
    </div>
    <div style="padding: 24px;">
      <div style="margin-bottom: 16px;">
        <span style="background: rgba(46, 160, 67, 0.15); color: #3fb950; border: 1px solid rgba(46, 160, 67, 0.4); padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">All checks passed</span>
      </div>
      <h2 style="font-size: 17px; color: #f0f6fc; margin: 0 0 12px 0;">Build & Test Pipeline completed</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #8b949e; margin: 0 0 20px 0;">
        Workflow <code style="color: #58a6ff;">ci-matrix.yml</code> ran on <code style="color: #f0f6fc;">main</code>. All 42 test suites finished in 1m 48s with zero regressions.
      </p>
      <a href="https://local.reloop.sh" style="background: #238636; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">View Workflow Run</a>
    </div>
  </div>
</body>
</html>`,
	},
	{
		from: "Tailscale Admin <notifications@local.reloop.sh>",
		to: "avery.penn@tailscale.com",
		subject: "New device node joined tailnet: macbook-pro-m3-pranav",
		tags: [
			{ name: "category", value: "network" },
			{ name: "service", value: "tailscale" },
		],
		text: "A new machine 'macbook-pro-m3-pranav' (100.84.192.12) authenticated to your tailnet. Key expiry: 180 days.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #fbfbfb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #232529;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border: 1px solid #e2e4e8; border-radius: 8px; padding: 32px;">
    <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Tailscale Device Connected</h2>
    <p style="font-size: 14px; color: #535862; line-height: 1.5; margin: 0 0 20px 0;">
      Machine <strong>macbook-pro-m3-pranav</strong> has joined your encrypted wireguard mesh.
    </p>
    <div style="background: #f4f5f7; border-radius: 6px; padding: 14px; font-family: monospace; font-size: 13px; margin-bottom: 24px;">
      Tailscale IP: 100.84.192.12<br/>
      MagicDNS: macbook-pro-m3-pranav.tailnet.net
    </div>
    <a href="https://local.reloop.sh" style="background: #232529; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 500; display: inline-block;">Manage Device in Admin</a>
  </div>
</body>
</html>`,
	},
	{
		from: "PostHog Insights <analytics@local.reloop.sh>",
		to: "james.hawkins@posthog.com",
		subject: "Weekly Product Digest: 142,500 active sessions (+18.4%)",
		tags: [
			{ name: "category", value: "analytics" },
			{ name: "service", value: "posthog" },
		],
		text: "Your weekly PostHog metrics: 142,500 active sessions (+18.4% WoW). Onboarding funnel conversion reached 64.2%.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #eeefe9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1d1f24;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border: 1px solid #d0d1c9; border-radius: 12px; padding: 32px;">
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <span style="font-size: 20px; font-weight: 800; color: #f54e00;">🦔 PostHog</span>
    </div>
    <h2 style="font-size: 19px; font-weight: 700; margin: 0 0 8px 0;">Weekly Analytics Overview</h2>
    <p style="font-size: 14px; color: #57595f; margin: 0 0 20px 0;">Week ending September 24, 2026</p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
      <div style="background: #f8f9f5; border: 1px solid #e0e1d9; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #73757d;">Total Sessions</div>
        <div style="font-size: 22px; font-weight: 700; color: #1d1f24; margin-top: 4px;">142,500</div>
        <div style="font-size: 12px; color: #2ea043; font-weight: 600; margin-top: 2px;">↑ 18.4% WoW</div>
      </div>
      <div style="background: #f8f9f5; border: 1px solid #e0e1d9; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #73757d;">Funnel Completion</div>
        <div style="font-size: 22px; font-weight: 700; color: #1d1f24; margin-top: 4px;">64.2%</div>
        <div style="font-size: 12px; color: #2ea043; font-weight: 600; margin-top: 2px;">↑ 4.1% WoW</div>
      </div>
    </div>
    <a href="https://local.reloop.sh" style="background: #f54e00; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">Open Dashboard</a>
  </div>
</body>
</html>`,
	},
	{
		from: "Slack Team <team@local.reloop.sh>",
		to: "stewart.butterfield@slack.com",
		subject: "Welcome to your new enterprise workspace on Slack",
		tags: [
			{ name: "category", value: "workspace" },
			{ name: "service", value: "slack" },
		],
		text: "Welcome to Acme Corp on Slack! 128 team channels have been configured with SSO enabled.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #f8f8f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1d1c1d;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border: 1px solid #dddddd; border-radius: 8px; padding: 32px;">
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #4a154b;">Slack Enterprise Grid</h2>
    <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">Welcome to Acme Corp</h1>
    <p style="font-size: 14.5px; line-height: 1.6; color: #1d1c1d; margin: 0 0 20px 0;">
      Your workspace has been provisioned with Okta SCIM and SAML 2.0 single sign-on.
    </p>
    <a href="https://local.reloop.sh" style="background: #4a154b; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 13px; font-weight: 600; display: inline-block;">Launch Slack</a>
  </div>
</body>
</html>`,
	},
	{
		from: "Datadog Ops <ops@local.reloop.sh>",
		to: "alexis.oncall@datadoghq.com",
		subject: "[P1 Resolved] API Gateway p99 response time returned to normal",
		tags: [
			{ name: "category", value: "monitoring" },
			{ name: "service", value: "datadog" },
		],
		text: "Monitor [Prod] API Gateway P99 latency recovered. Current value: 38ms (threshold: 250ms). Duration of incident: 8m 40s.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #262930; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e1e3e6;">
  <div style="max-width: 580px; margin: 40px auto; background: #1c1d21; border-radius: 8px; border: 1px solid #3c3f47; padding: 28px;">
    <div style="display: flex; align-items: center; margin-bottom: 16px;">
      <span style="background: rgba(43, 194, 83, 0.2); color: #2bc253; border: 1px solid #2bc253; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">RECOVERED</span>
      <span style="color: #92959e; font-size: 13px; margin-left: 10px;">Monitor #91824</span>
    </div>
    <h2 style="font-size: 17px; margin: 0 0 12px 0; color: #ffffff;">API Gateway P99 latency within SLO</h2>
    <p style="font-size: 14px; color: #b1b4bd; line-height: 1.5; margin: 0 0 20px 0;">
      Latency on <code style="color: #6366f1;">api.production</code> decreased to <strong>38.2ms</strong>, recovering below the critical threshold of 250ms.
    </p>
    <a href="https://local.reloop.sh" style="background: #6366f1; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 500; display: inline-block;">Open Datadog Incident</a>
  </div>
</body>
</html>`,
	},
	{
		from: "Raycast <store@local.reloop.sh>",
		to: "thomas.paul@raycast.com",
		subject: 'Extension published: "Reloop Email Dispatcher for Raycast"',
		tags: [
			{ name: "category", value: "extensions" },
			{ name: "service", value: "raycast" },
		],
		text: 'Congratulations! Your Raycast extension "Reloop Email Dispatcher" is now approved and live on the Raycast Store.',
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #121316; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f0f2f5;">
  <div style="max-width: 560px; margin: 40px auto; background: #1b1d22; border: 1px solid #2d313a; border-radius: 12px; padding: 32px;">
    <h3 style="font-size: 16px; font-weight: 700; color: #ff6363; margin: 0 0 16px 0;">Raycast Store</h3>
    <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">Your Extension is Live!</h1>
    <p style="font-size: 14px; color: #9da3b4; line-height: 1.6; margin: 0 0 24px 0;">
      <strong>Reloop Email Dispatcher</strong> has been reviewed and accepted into the community registry. Over 300,000 developers can now install it via <code style="background: #252830; padding: 2px 6px; border-radius: 4px; color: #ff6363;">raycast://extensions/reloop</code>.
    </p>
    <a href="https://local.reloop.sh" style="background: #ff6363; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">View on Store</a>
  </div>
</body>
</html>`,
	},
	{
		from: "Cloudflare <workers@local.reloop.sh>",
		to: "matthew.prince@cloudflare.com",
		subject: "Deployment successful: edge-email-router to 330+ locations",
		tags: [
			{ name: "category", value: "serverless" },
			{ name: "service", value: "cloudflare" },
		],
		text: "Cloudflare Workers: edge-email-router deployed to all edge locations in 420ms with smart placement enabled.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e1e1e;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; padding: 32px;">
    <h2 style="font-size: 18px; color: #f6821f; font-weight: 700; margin: 0 0 16px 0;">Cloudflare Workers</h2>
    <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">Worker Deployed Globally</h1>
    <p style="font-size: 14px; color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
      Your worker <strong>edge-email-router</strong> (v3.1.2) is now serving requests with 0ms cold starts across 330+ data centers worldwide.
    </p>
    <a href="https://local.reloop.sh" style="background: #f6821f; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">Open Cloudflare Dashboard</a>
  </div>
</body>
</html>`,
	},
	{
		from: "Airbnb Travel <bookings@local.reloop.sh>",
		to: "brian.chesky@airbnb.com",
		subject: "Reservation confirmed: Minimalist Loft in Shibuya, Tokyo",
		tags: [
			{ name: "category", value: "booking" },
			{ name: "service", value: "airbnb" },
		],
		text: "Pack your bags! Your reservation in Shibuya, Tokyo is confirmed for Oct 12 - Oct 18, 2026. Host: Kenji Sato.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #222222;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); padding: 32px;">
    <div style="color: #ff385c; font-size: 22px; font-weight: 700; margin-bottom: 20px;">airbnb</div>
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 10px 0;">You're going to Tokyo!</h2>
    <p style="font-size: 14.5px; color: #717171; margin: 0 0 24px 0;">Reservation code: <strong>HM82XP4Q</strong></p>
    <div style="border-top: 1px solid #ebebeb; border-bottom: 1px solid #ebebeb; padding: 16px 0; margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Dates:</strong> Oct 12 – Oct 18, 2026 (6 nights)</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Listing:</strong> Minimalist Loft near Shibuya Station</p>
      <p style="margin: 0; font-size: 14px;"><strong>Host:</strong> Kenji Sato</p>
    </div>
    <a href="https://local.reloop.sh" style="background: #ff385c; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block;">View Reservation</a>
  </div>
</body>
</html>`,
	},
	{
		from: "Uber Rides <rides@local.reloop.sh>",
		to: "dara.khosrowshahi@uber.com",
		subject: "Your Tuesday evening trip with Uber Black ($48.20 USD)",
		tags: [
			{ name: "category", value: "receipt" },
			{ name: "service", value: "uber" },
		],
		text: "Thanks for riding, Dara. Total for your Uber Black trip from SFO Terminal 2 to Financial District: $48.20 USD.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <div style="max-width: 560px; margin: 40px auto; background: #000000; border: 1px solid #333333; border-radius: 8px; padding: 32px;">
    <h2 style="font-size: 24px; font-weight: 400; margin: 0 0 24px 0; letter-spacing: -0.5px;">Uber</h2>
    <div style="font-size: 28px; font-weight: 600; margin-bottom: 6px;">$48.20</div>
    <p style="color: #a6a6a6; font-size: 14px; margin: 0 0 24px 0;">Tuesday, September 24, 2026</p>
    <div style="border-top: 1px solid #262626; padding: 16px 0; font-size: 14px; line-height: 1.8;">
      <div style="color: #a6a6a6;">Pickup: <strong>SFO International Airport, Terminal 2</strong></div>
      <div style="color: #a6a6a6;">Dropoff: <strong>Market St, Financial District, SF</strong></div>
      <div style="color: #a6a6a6;">Vehicle: <strong>Uber Black (Mercedes-Benz S-Class)</strong></div>
    </div>
  </div>
</body>
</html>`,
	},
	{
		from: "Notion Team <workspace@local.reloop.sh>",
		to: "ivan.zhao@makenotion.com",
		subject: "Workspace digest: 24 new documents added this week",
		tags: [
			{ name: "category", value: "digest" },
			{ name: "service", value: "notion" },
		],
		text: "Here is your team's weekly Notion recap: 24 documents added, 148 page edits, and 12 database entries updated.",
		html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background-color: #f7f6f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #37352f;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 10px; border: 1px solid #e9e9e7; padding: 32px;">
    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">Notion Weekly Recap</h2>
    <p style="font-size: 14px; color: #787774; margin: 0 0 20px 0;">Your team made significant progress in <strong>Reloop Product Roadmap</strong>:</p>
    <div style="background: #f7f6f3; border-radius: 6px; padding: 16px; font-size: 14px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0;">📄 <strong>Architecture RFC: KumoMTA Cluster</strong> (updated by Pranav)</p>
      <p style="margin: 0 0 8px 0;">📄 <strong>Q4 OKRs & Deliverables</strong> (approved by Leadership)</p>
      <p style="margin: 0;">📄 <strong>Brand Guidelines 2026</strong> (finalized)</p>
    </div>
    <a href="https://local.reloop.sh" style="background: #2eaadc; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">Open Workspace</a>
  </div>
</body>
</html>`,
	},
];

async function sendEmail(email: DemoEmail, index: number, total: number) {
	console.log(`[${index + 1}/${total}] Sending "${email.subject}" to ${email.to}...`);

	const res = await fetch(`${BASE_URL}/api/mail/v1/send`, {
		method: "POST",
		headers: {
			"x-api-key": API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(email),
	});

	const data = await res.json();
	if (res.ok && data.success) {
		console.log(`  ✅ Sent: ID = ${data.id || data.messageId}`);
	} else {
		console.error(`  ❌ Failed (Status ${res.status}):`, data);
	}
}

async function run() {
	console.log(`🚀 Starting transactional email generation...`);
	console.log(`📡 Target API: ${BASE_URL}/api/mail/v1/send`);
	console.log(`🔑 Using Key: ${API_KEY.slice(0, 14)}...`);
	console.log(`📬 Total Emails to Send: ${demoEmails.length}\n`);

	for (let i = 0; i < demoEmails.length; i++) {
		await sendEmail(demoEmails[i], i, demoEmails.length);
		await new Promise((resolve) => setTimeout(resolve, 300));
	}

	console.log(`\n🎉 Finished sending demo transactional emails!`);
}

run().catch(console.error);
