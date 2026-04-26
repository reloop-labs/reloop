local constants = {}

constants.kumomta_key = os.getenv("X_KUMOMTA_KEY") or "reloop"
constants.base_url = os.getenv("BASE_URL") or "https://local.reloop.sh"

-- Extract hostname from environment or base_url
local hostname = os.getenv("KUMOMTA_HOSTNAME")
if not hostname then
  hostname = constants.base_url:match("https?://([^/:]+)")
end
constants.hostname = hostname or "localhost"

local raw_url = os.getenv("KUMOMTA_WEBHOOK_URL") or "http://host.docker.internal:8021"
-- Ensure it ends with /api/kumomta if it doesn't already
if not raw_url:find("/api/kumomta$") and not raw_url:find("/api/kumomta/$") then
  raw_url = raw_url:gsub("/+$", "") .. "/api/kumomta"
end
constants.kumomta_url = raw_url

print("[DEBUG] constants.hostname = " .. constants.hostname)
print("[DEBUG] constants.kumomta_key = " .. constants.kumomta_key)
print("[DEBUG] constants.base_url = " .. constants.base_url)
print("[DEBUG] constants.kumomta_url = " .. constants.kumomta_url)

return constants
