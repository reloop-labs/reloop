local kumo = require 'kumo'

--[[
  KumoMTA Local Development Policy
  Routes ALL email to Mailpit for local testing.
]]

-- Called once on startup to set up listeners and spool
kumo.on('init', function()
  -- Define the spool (required by KumoMTA)
  kumo.define_spool {
    name = 'data',
    path = '/var/spool/kumomta/data',
  }

  kumo.define_spool {
    name = 'meta',
    path = '/var/spool/kumomta/meta',
  }

  -- ESMTP listener for injecting mail
  kumo.start_esmtp_listener {
    listen = '0.0.0.0:25',
    -- Allow relay from any source (local dev only!)
    relay_hosts = { '0.0.0.0/0' },
  }

  -- HTTP API listener
  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
    trusted_hosts = { '0.0.0.0/0' },
  }
end)

-- Route ALL mail to Mailpit's SMTP on port 1025
kumo.on('get_queue_config', function(domain, tenant, campaign, routing_domain)
  return kumo.make_queue_config {
    protocol = {
      smtp = {
        mx_list = { 'reloop-mailpit:1025' },
      },
    },
  }
end)
