local kumo = require 'kumo'

-- Load inbound policy
require 'policy.inbound'

local constants = require 'policy.constants'

kumo.on('init', function()
  kumo.define_spool {
    name = 'data',
    path = '/var/spool/kumomta/data',
  }

  kumo.define_spool {
    name = 'meta',
    path = '/var/spool/kumomta/meta',
  }

  -- Port 25: Standard SMTP for inbound email reception (open MX)
  kumo.start_esmtp_listener {
    listen = '0.0.0.0:25',
    hostname = constants.hostname,
  }

  -- HTTP listener for health checks only
  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
  }
end)
