local constants = {}

constants.env = os.getenv("NODE_ENV") or os.getenv("KUMOMTA_ENV") or "production"
constants.base_url = os.getenv("BASE_URL") or "https://local.reloop.sh"

-- 1. Extract hostname from BASE_URL (fallback to local.reloop.sh if it fails)
local hostname = constants.base_url:match("https?://([^/:]+)")
if not hostname or hostname == "" or hostname:match("^%x+$") then
  hostname = "local.reloop.sh"
end
constants.hostname = hostname

-- 2. Webhook URL to send callbacks to
local default_webhook_url
if constants.env == "development" then
  default_webhook_url = "http://host.docker.internal:8011/api/domain"
else
  default_webhook_url = constants.base_url .. "/api/domain"
end
constants.kumomta_url = os.getenv("KUMOMTA_WEBHOOK_URL") or default_webhook_url

-- 3. NATS connection URL
constants.nats_url = os.getenv("NATS_URL") or "reloop-nats:4222"

print("[DEBUG] constants.env = " .. constants.env)
print("[DEBUG] constants.hostname = " .. constants.hostname)
print("[DEBUG] constants.base_url = " .. constants.base_url)
print("[DEBUG] constants.kumomta_url = " .. constants.kumomta_url)
print("[DEBUG] constants.nats_url = " .. constants.nats_url)

return constants
