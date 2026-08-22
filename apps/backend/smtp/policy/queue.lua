local kumo = require 'kumo'
local constants = require 'policy.constants'
local tls = require 'policy.tls'

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
