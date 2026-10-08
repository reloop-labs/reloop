# Supabase Auth emails through Reloop

This Edge Function connects Supabase's Send Email Hook to Reloop's mail API.
It sends signup confirmations, invitations, magic links, password recovery,
email-change confirmations, and reauthentication codes. It verifies the hook
signature before sending and uses a separate idempotency key for each recipient.

## Setup

1. Verify a sending domain in the [Reloop dashboard](https://reloop.sh/dashboard)
   and create an API key with permission to send mail from it.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
   and run these commands from `integrations/supabase`:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy reloop-send-email --no-verify-jwt
   ```

3. In Supabase, open **Authentication > Hooks**, add a **Send Email** HTTP hook,
   and set the URL to
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/reloop-send-email`.
   Generate a hook secret. Leave the hook disabled until you finish setting secrets.
4. Create an ignored `.env.hook` file in `integrations/supabase`:

   ```dotenv
   RELOOP_API_KEY=YOUR_RELOOP_API_KEY
   RELOOP_FROM="Example <auth@example.com>"
   SEND_EMAIL_HOOK_SECRET="v1,whsec_YOUR_GENERATED_SECRET"
   ```

5. Upload the secrets, then enable the Send Email hook:

   ```bash
   supabase secrets set --env-file .env.hook
   ```

   Supabase supplies `SUPABASE_URL` automatically. For self-hosted Reloop, also set
   `RELOOP_API_URL=https://reloop.example.com/api/mail/v1/send` in `.env.hook`.
   The endpoint must use HTTPS with a trusted certificate and accept requests
   without redirects.

The function disables Supabase JWT verification because Auth hooks authenticate
with Standard Webhooks signatures. The hook secret is mandatory. Never expose it
or your Reloop API key in frontend code.

An enabled Send Email hook takes over email delivery from SMTP. Keep Supabase's
Email provider enabled. Supabase's email template editor does not control this
function's messages; edit `handler.ts` to change its plain-text copy.

## Verify before enabling for users

- Trigger signup, a magic link, an invitation, password recovery, and
  reauthentication in a test project. Check Reloop's email logs and the receiving
  inbox, then use each link or code in your application.
- With Secure Email Change enabled, check both the current and new inboxes.
  Each receives its own code and link. With it disabled, only the new address
  receives mail.
- Set Supabase's Site URL and redirect allowlist to your application URLs.
- Leave security notification email options disabled unless you extend the
  handler for their action types. Unsupported actions return an error.

The function allows four seconds for Reloop's HTTP request within Supabase's
five-second hook budget. An API error, timeout, or failed send returns a generic
hook error without exposing provider responses. An accepted API request does
not prove inbox delivery. Review Reloop's delivery events when troubleshooting.

Retries reuse `Idempotency-Key` values derived from the signed `webhook-id` and
recipient position. A previously failed Reloop send remains an error on replay;
after fixing the cause, trigger a new Auth email. This integration does not add
an independent retry queue.

## Local checks

With Deno installed, run from this directory:

```bash
deno test --config supabase/functions/reloop-send-email/deno.json supabase/functions/reloop-send-email/handler_test.ts
deno check --config supabase/functions/reloop-send-email/deno.json supabase/functions/reloop-send-email/index.ts
```

The tests use signed fixtures and a fake mail transport. They cover signature
validation, all supported actions, both email-change modes, idempotency keys,
provider errors, and HTTPS configuration. They do not send real mail.

The email-change token mapping follows the
[Supabase Send Email Hook contract](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook).
Hook error responses and execution limits follow the
[Auth Hooks documentation](https://supabase.com/docs/guides/auth/auth-hooks).
