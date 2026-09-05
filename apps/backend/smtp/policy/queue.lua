local kumo = require 'kumo'
local constants = require 'policy.constants'
local tls = require 'policy.tls'

-- Sending Engine hooks.
-- The mail service guard (step-0-guard.ts) decides per-send:
--   X-Reloop-Pool / X-Reloop-Decision: allow|throttle|reroute|pause
-- KumoMTA's get_queue_config only sees (domain, tenant, campaign),
-- so smtp.lua copies those headers into message metadata; Lua queue
-- policy below honors them via the tenant slot when present.
--
-- Pool allowlist: engine pools fall back to passthrough egress entries,
-- so new pools need no kumod restart. TLS pools keep existing behavior.
--
-- NOTE: only documented make_queue_config keys are used here
-- (egress_pool, retry_interval, max_message_rate, protocol).
-- See https://docs.kumomta.com/reference/kumo/make_queue_config/

-- Per-provider arrival caps (messages/sec into the queue). Keeps
-- Gmail/Outlook bulk senders under deferral thresholds during warmup.
local PROVIDER_MAX_RATE = {
  ['gmail.com'] = '10/sec',
  ['googlemail.com'] = '10/sec',
  ['outlook.com'] = '8/sec',
  ['hotmail.com'] = '8/sec',
  ['live.com'] = '8/sec',
  ['yahoo.com'] = '8/sec',
}

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

  -- Engine pool passthrough: tenant carries "pool:<name>" when smtp.lua
  -- mapped X-Reloop-Pool into the tenant slot.
  local egress_pool = tls.egress_pool(tenant)
  if type(tenant) == 'string' then
    local engine_pool = tenant:match('^pool:(.+)$')
    if engine_pool and engine_pool ~= '' then
      egress_pool = engine_pool
    end
  end

  local queue = {
    egress_pool = egress_pool,
  }

  -- Throttle tenant ("throttle:<pool>") gets gentler retry + lower rate.
  if type(tenant) == 'string' and tenant:find('^throttle:') then
    queue.retry_interval = '10m'
    queue.max_message_rate = '20/min'
  end

  local lower_domain = string.lower(domain or '')
  if PROVIDER_MAX_RATE[lower_domain] then
    queue.max_message_rate = PROVIDER_MAX_RATE[lower_domain]
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
