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
    -- Do not treat any client as a trusted relay host
    relay_hosts = {},
  }

  -- HTTP listener for health checks only (no remote inject)
  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
    trusted_hosts = { '127.0.0.1', '::1' },
  }
end)
