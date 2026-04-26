local kumo = require 'kumo'
local constants = require 'policy.constants'

kumo.on('get_queue_config', function(domain, tenant, campaign, routing_domain)
  if domain:find('%.log_hook$') then
    return kumo.make_queue_config {
      -- Use default for webhooks (which is the lua constructor we defined)
    }
  end

  local env = os.getenv('NODE_ENV') or os.getenv('KUMOMTA_ENV') or 'production'
  if env == 'development' then
    return kumo.make_queue_config {
      protocol = {
        smtp = {
          mx_list = { 'reloop-mailpit:1025' },
          ehlo_domain = constants.hostname,
        },
      },
    }
  end

  return kumo.make_queue_config {
    protocol = {
      smtp = {
        ehlo_domain = constants.hostname,
      },
    },
  }
end)

kumo.on('get_egress_path_config', function(routing_domain, egress_source, site_name)
  local make = kumo.make_egress_path or function(t) return t end
  return make {
    enable_tls = "OpportunisticInsecure",
    ehlo_domain = constants.hostname,
  }
end)

kumo.on('get_egress_source', function(source_name)
  local make = kumo.make_egress_source or function(t) return t end
  return make {
    ehlo_domain = constants.hostname,
  }
end)
