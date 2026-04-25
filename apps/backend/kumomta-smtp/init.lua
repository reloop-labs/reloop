local kumo = require 'kumo'

-- Load split modules
require 'policy.webhooks'
require 'policy.smtp'
require 'policy.queue'

kumo.on('init', function()
  kumo.define_spool {
    name = 'data',
    path = '/var/spool/kumomta/data',
  }

  kumo.define_spool {
    name = 'meta',
    path = '/var/spool/kumomta/meta',
  }

  kumo.start_esmtp_listener {
    listen = '0.0.0.0:25',
    -- allow connection (NOT relay)
  }

  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
  }
end)
