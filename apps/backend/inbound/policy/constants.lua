local constants = {}

constants.env = os.getenv("NODE_ENV") or os.getenv("KUMOMTA_ENV") or "production"

-- 1. Hostname for EHLO (defaults to inbound.reloop.sh)
constants.hostname = os.getenv("INBOUND_HOSTNAME") or "inbound.reloop.sh"

-- 2. NATS connection URL
constants.nats_url = os.getenv("NATS_URL") or "reloop-nats:4222"

-- 3. RSpamD URL for spam scanning
local default_rspamd_url
if constants.env == "development" then
  default_rspamd_url = "http://reloop-rspamd:11333/checkv2"
else
  default_rspamd_url = "http://localhost:11333/checkv2"
end
constants.rspamd_url = os.getenv("KUMOMTA_RSPAMD_URL") or default_rspamd_url

-- 4. Check-recipient URL (domain service endpoint to validate mailboxes)
local default_check_recipient_url
if constants.env == "development" then
  default_check_recipient_url = "http://host.docker.internal:8011/api/domain"
else
  default_check_recipient_url = "https://reloop.sh/api/domain"
end
constants.check_recipient_url = os.getenv("KUMOMTA_CHECK_RECIPIENT_URL") or default_check_recipient_url

print("[INBOUND] constants.env = " .. constants.env)
print("[INBOUND] constants.hostname = " .. constants.hostname)
print("[INBOUND] constants.nats_url = " .. constants.nats_url)
print("[INBOUND] constants.rspamd_url = " .. constants.rspamd_url)
print("[INBOUND] constants.check_recipient_url = " .. constants.check_recipient_url)

return constants
