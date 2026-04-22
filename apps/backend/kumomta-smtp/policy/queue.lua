local kumo = require 'kumo'

kumo.on('get_queue_config', function(domain, tenant, campaign, routing_domain)
  if domain:find('%.log_hook$') then
    return kumo.make_queue_config {
      -- Use default for webhooks (which is the lua constructor we defined)
    }
  end

  return kumo.make_queue_config {
    protocol = {
      smtp = {
        mx_list = { 'reloop-mailpit:1025' },
      },
    },
  }
end)
