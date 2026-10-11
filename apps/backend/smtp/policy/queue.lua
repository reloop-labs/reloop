local kumo = require 'kumo'
local constants = require 'policy.constants'
local tls = require 'policy.tls'
local byo = require 'policy.byo'

-- Fetch a customer relay (host, vetted IP, credentials) from the domain
-- service. Cached briefly so queue/egress hooks don't hit the API per message.
local function fetch_relay(provider_id)
  local client = kumo.http.build_client({})
  local resp = client:post(constants.kumomta_url .. '/v1/smtp-relay')
    :header('Content-Type', 'application/json')
    :header('User-Agent', 'ReloopSmtp/1.0')
    :header('x-internal-secret', constants.internal_secret)
    :body(kumo.serde.json_encode({ providerId = provider_id }))
    :send()
  local code = resp:status_code()
  if code ~= 200 then
    error('smtp-relay lookup for ' .. provider_id .. ' failed: status=' .. tostring(code))
  end
  return kumo.serde.json_parse(resp:text())
end

local get_relay = kumo.memoize(fetch_relay, {
  name = 'byo_smtp_relay',
  ttl = '60 seconds',
  capacity = 1000,
})

kumo.on('get_egress_pool', function(pool_name)
  local make = kumo.make_egress_pool or function(t) return t end
  return make {
    name = pool_name,
    entries = {
      { name = pool_name },
    },
  }
end)

kumo.on('get_queue_config', function(domain, tenant, campaign, routing_domain)
  if domain:find('%.log_hook$') then
    return kumo.make_queue_config {
      -- Use default for webhooks (which is the lua constructor we defined)
    }
  end

  local queue = {
    egress_pool = tls.egress_pool(tenant),
  }

  -- Bring-your-own SMTP: relay to the customer's server as a smart host.
  local provider_id = byo.provider_id_from_routing_domain(routing_domain)
  if provider_id then
    local relay = get_relay(provider_id)
    queue.protocol = {
      smtp = {
        mx_list = { byo.mx_entry(relay) },
        ehlo_domain = constants.hostname,
      },
    }
    return kumo.make_queue_config(queue)
  end

  if tls.is_development(constants.env) then
    queue.protocol = {
      smtp = {
        mx_list = { 'reloop-mailpit:1025' },
        ehlo_domain = constants.hostname,
      },
    }
  else
    queue.protocol = {
      smtp = {
        ehlo_domain = constants.hostname,
      },
    }
  end

  return kumo.make_queue_config(queue)
end)

kumo.on('get_egress_path_config', function(routing_domain, egress_source, site_name)
  local make = kumo.make_egress_path or function(t) return t end

  local provider_id = byo.provider_id_from_routing_domain(routing_domain)
  if provider_id then
    local relay = get_relay(provider_id)
    local path = {
      enable_tls = byo.enable_tls(relay.security),
      ehlo_domain = constants.hostname,
      smtp_port = relay.port,
      -- Customer relays are not MX hosts; be gentle with their limits.
      connection_limit = 5,
    }
    if type(relay.username) == 'string' and type(relay.password) == 'string' then
      path.smtp_auth_plain_username = relay.username
      path.smtp_auth_plain_password = { key_data = relay.password }
      path.allow_smtp_auth_plain_without_tls = relay.security == 'none'
    end
    return make(path)
  end

  return make {
    enable_tls = tls.enable_tls(constants.env, egress_source),
    ehlo_domain = constants.hostname,
  }
end)

kumo.on('get_egress_source', function(source_name)
  local make = kumo.make_egress_source or function(t) return t end
  return make {
    name = source_name,
    ehlo_domain = constants.hostname,
  }
end)
