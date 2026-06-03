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

  -- Port 2587: Alternative submission with STARTTLS (for networks blocking 587)
  kumo.start_esmtp_listener {
    listen = '0.0.0.0:2587',
    hostname = constants.hostname,
  }

  -- Port 465: SMTPS with implicit TLS
  kumo.start_esmtp_listener {
    listen = '0.0.0.0:465',
    hostname = constants.hostname,
    implicit_tls = true,
  }

  -- Port 2465: Alternative SMTPS with implicit TLS (for networks blocking 465)
  kumo.start_esmtp_listener {
    listen = '0.0.0.0:2465',
    hostname = constants.hostname,
    implicit_tls = true,
  }

  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
    trusted_hosts = constants.trusted_hosts,
  }
end)
