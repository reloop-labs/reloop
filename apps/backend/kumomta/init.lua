local kumo = require 'kumo'
local log_hooks = require 'policy-extras.log_hooks'

-- Mail service API URL for DB-driven config
local mail_service_url = os.getenv('MAIL_SERVICE_URL') or 'http://mail-service:8015'
local mail_hostname = os.getenv('MAIL_HOSTNAME') or 'mail.localhost'
local webhook_url = os.getenv('WEBHOOK_URL') or (mail_service_url .. '/api/mail/v1/kumomta/webhook')

-- In-memory DKIM key cache: { [domain] = { data = {...}, fetched_at = timestamp } }
local dkim_cache = {}
local CACHE_TTL_SECONDS = 300 -- 5 minutes

-- Fetch DKIM config from the mail service API (backed by PostgreSQL)
local function fetch_dkim_config(domain_name)
  -- Check cache first
  local cached = dkim_cache[domain_name]
  if cached and (os.time() - cached.fetched_at) < CACHE_TTL_SECONDS then
    return cached.data
  end

  local url = mail_service_url .. '/api/mail/v1/kumomta/dkim/' .. domain_name

  local ok, response = pcall(function()
    return kumo.http.build_client_request({
      url = url,
      method = 'GET',
      headers = { ['Accept'] = 'application/json' },
    })
  end)

  if not ok or not response then
    kumo.log('error', 'Failed to fetch DKIM config for ' .. domain_name .. ': HTTP request failed')
    return nil
  end

  local status = response:status_code()
  if status ~= 200 then
    kumo.log('warn', 'DKIM config not found for ' .. domain_name .. ' (HTTP ' .. tostring(status) .. ')')
    -- Cache the miss to avoid hammering the API
    dkim_cache[domain_name] = { data = nil, fetched_at = os.time() }
    return nil
  end

  local ok2, data = pcall(function()
    return response:json()
  end)

  if not ok2 or not data or not data.privateKey then
    kumo.log('error', 'Invalid DKIM config response for ' .. domain_name)
    return nil
  end

  -- Cache successful response
  dkim_cache[domain_name] = { data = data, fetched_at = os.time() }
  kumo.log('info', 'DKIM config fetched and cached for ' .. domain_name .. ' (selector: ' .. data.selector .. ')')

  return data
end

-- DKIM sign a message using DB-sourced keys
local function dkim_sign_from_db(msg)
  local from = msg:from_header()
  if not from then
    return
  end

  local domain_name = from.domain
  local config = fetch_dkim_config(domain_name)

  if not config then
    kumo.log('warn', 'Skipping DKIM signing for ' .. domain_name .. ' (no config in DB)')
    return
  end

  local signer = kumo.dkim.rsa_sha256_signer {
    domain = config.domain,
    selector = config.selector,
    headers = { 'From', 'To', 'Subject', 'Date', 'Mime-Version', 'Content-Type' },
    key = { key_data = config.privateKey },
  }
  msg:dkim_sign(signer)
end

-- Define SMTP Listener (legacy/fallback)
kumo.start_esmtp_listener {
  listen = '0.0.0.0:25',
  hostname = mail_hostname,
  relay_hosts = { '127.0.0.1', '172.16.0.0/12', '192.168.0.0/16', '10.0.0.0/8' },
  tls_certificate = '/opt/kumomta/etc/tls/server.crt',
  tls_private_key = '/opt/kumomta/etc/tls/server.key',
}

-- HTTP Listener for injection API (/api/inject/v1)
kumo.start_http_listener {
  listen = '0.0.0.0:8000',
  trusted_hosts = { '127.0.0.1', '172.16.0.0/12', '192.168.0.0/16', '10.0.0.0/8' },
}

-- Webhook: push delivery/bounce/failure events to mail service
log_hooks:new_json {
  name = 'webhook',
  url = webhook_url,
  log_parameters = {
    headers = { 'Subject', 'X-Org-ID', 'X-Domain-ID', 'X-Email-Log-ID' },
  },
}

-- DKIM signing for SMTP-injected messages (DB-driven)
kumo.on('smtp_server_message_received', function(msg)
  dkim_sign_from_db(msg)
end)

-- DKIM signing for HTTP-injected messages (DB-driven)
kumo.on('http_message_generated', function(msg)
  dkim_sign_from_db(msg)
end)

-- Logging and bounce classification
kumo.on('init', function()
  kumo.configure_logging {
    serialize_fallback = true,
  }

  kumo.configure_bounce_classifier {
    files = {
      '/opt/kumomta/share/bounce_classifier/iana.toml',
    },
  }
end)

-- Traffic Shaping and delivery rules
kumo.on('get_queue_config', function(domain, tenant, campaign)
  return kumo.make_queue_config {
    max_connection_rate = '10/s',
    max_delivery_rate = '100/s',
  }
end)
