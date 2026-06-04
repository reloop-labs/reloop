local constants = {}

constants.env = os.getenv("NODE_ENV") or os.getenv("KUMOMTA_ENV") or "production"
constants.base_url = os.getenv("BASE_URL") or "https://local.reloop.sh"
constants.tracking_secret = os.getenv("TRACKING_SECRET") or "reloop_tracking_secret_default_123"

-- 1. Get hostname from environment variable HOSTNAME (fallback to extracting from BASE_URL)
local hostname = os.getenv("HOSTNAME")
if not hostname or hostname == "" then
  hostname = constants.base_url:match("https?://([^/:]+)")
end
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

local default_inbox_url
if constants.env == "development" then
  default_inbox_url = "http://host.docker.internal:8017/api/inbox"
else
  default_inbox_url = constants.base_url .. "/api/inbox"
end
constants.inbox_url = os.getenv("KUMOMTA_INBOX_URL") or default_inbox_url

local default_rspamd_url
if constants.env == "development" then
  default_rspamd_url = "http://reloop-rspamd:11333/checkv2"
else
  default_rspamd_url = "http://localhost:11333/checkv2"
end
constants.rspamd_url = os.getenv("KUMOMTA_RSPAMD_URL") or default_rspamd_url

-- 3. NATS connection URL
constants.nats_url = os.getenv("NATS_URL") or "reloop-nats:4222"

-- 4. Trusted hosts for HTTP listener
local trusted_hosts = {}
local trusted_hosts_env = os.getenv("KUMOMTA_TRUSTED_HOSTS")
if trusted_hosts_env and trusted_hosts_env ~= "" then
  for host in string.gmatch(trusted_hosts_env, "[^,]+") do
    local trimmed = host:match("^%s*(.-)%s*$")
    if trimmed ~= "" then
      table.insert(trusted_hosts, trimmed)
    end
  end
else
  trusted_hosts = {
    '127.0.0.1',
    '::1',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
  }
end
constants.trusted_hosts = trusted_hosts

print("[DEBUG] constants.env = " .. constants.env)
print("[DEBUG] constants.hostname = " .. constants.hostname)
print("[DEBUG] constants.base_url = " .. constants.base_url)
print("[DEBUG] constants.kumomta_url = " .. constants.kumomta_url)
print("[DEBUG] constants.rspamd_url = " .. constants.rspamd_url)
print("[DEBUG] constants.nats_url = " .. constants.nats_url)
print("[DEBUG] constants.trusted_hosts = " .. table.concat(constants.trusted_hosts, ", "))

return constants
