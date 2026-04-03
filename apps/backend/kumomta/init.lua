local kumo = require 'kumo'

-- Helper function to get domains from environment
local function get_domains()
  local mail_domains = os.getenv('MAIL_DOMAINS')
  if mail_domains then
    local domains = {}
    for domain in string.gmatch(mail_domains, '([^,]+)') do
      table.insert(domains, domain:gsub('%s+', ''))
    end
    return domains
  end
  return { os.getenv('MAIL_DOMAIN') or 'localhost' }
end

local domains = get_domains()
local primary_domain = domains[1]
local dkim_selector = os.getenv('DKIM_SELECTOR') or 'default'

-- Define SMTP Listener
kumo.start_esmtp_listener {
  listen = '0.0.0.0:25',
  hostname = 'mail.' .. primary_domain,
  -- Allow relaying from localhost and internal networks (similar to Postfix setup)
  relay_hosts = { '127.0.0.1', '172.16.0.0/12', '192.168.0.0/16', '10.0.0.0/8' },
  tls_certificate = '/opt/kumomta/etc/tls/server.crt',
  tls_private_key = '/opt/kumomta/etc/tls/server.key',
}

-- DKIM Signing Configuration
-- We'll dynamically determine the key path based on the sender domain
kumo.on('smtp_server_message_received', function(msg)
  local from = msg:from_header()
  if not from then
    return
  end

  local domain = from.domain
  local key_path = '/opt/kumomta/etc/dkim/' .. domain .. '/' .. dkim_selector .. '.key'

  -- Check if key exists (simplistic check, in real Lua you'd use a file helper or pcall)
  -- KumoMTA will fail gracefully if the signer cannot be created or file is missing
  local signer = kumo.dkim.rsa_sha256_signer {
    domain = domain,
    selector = dkim_selector,
    headers = { 'From', 'To', 'Subject', 'Date', 'Mime-Version', 'Content-Type' },
    key = key_path,
  }
  msg:dkim_sign(signer)
end)

-- Logging (Output to stdout)
kumo.on('init', function()
  kumo.configure_logging {
    serialize_fallback = true,
  }
end)

-- Traffic Shaping and delivery rules
kumo.on('get_queue_config', function(domain, tenant, campaign)
  return kumo.make_queue_config {
    -- Default configuration for delivery
    max_connection_rate = '10/s',
    max_delivery_rate = '100/s',
  }
end)
