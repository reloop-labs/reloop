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
          ehlo_hostname = constants.hostname,
        },
      },
    }
  end

  return kumo.make_queue_config {
    protocol = {
      smtp = {
        ehlo_hostname = constants.hostname,
      },
    },
  }
end)
