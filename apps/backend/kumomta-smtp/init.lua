local kumo = require 'kumo'

-- Load split modules
require 'policy.webhooks'
require 'policy.smtp'
require 'policy.queue'

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

  -- Port 25: Standard SMTP with STARTTLS
  kumo.start_esmtp_listener {
    listen = '0.0.0.0:25',
    hostname = constants.hostname,
  }

  -- Port 587: Submission with STARTTLS (explicit TLS)
  kumo.start_esmtp_listener {
    listen = '0.0.0.0:587',
    hostname = constants.hostname,
  }

  -- Port 2025: Alternate SMTP submission (for networks blocking 25/587)
  kumo.start_esmtp_listener {
    listen = '0.0.0.0:2025',
    hostname = constants.hostname,
  }

  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
    trusted_hosts = constants.trusted_hosts,
  }
end)
