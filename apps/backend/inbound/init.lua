local kumo = require 'kumo'

-- Load inbound policy
require 'policy.inbound'

local constants = require 'policy.constants'

kumo.on('init', function()
  kumo.define_spool {
    name = 'data',
    path = '/var/spool/kumomta/data',
    min_free_space = os.getenv("KUMOMTA_MIN_FREE_SPACE") or '1%',
    min_free_inodes = tonumber(os.getenv("KUMOMTA_MIN_FREE_INODES")) or 0,
  }

  kumo.define_spool {
    name = 'meta',
    path = '/var/spool/kumomta/meta',
    min_free_space = os.getenv("KUMOMTA_MIN_FREE_SPACE") or '1%',
    min_free_inodes = tonumber(os.getenv("KUMOMTA_MIN_FREE_INODES")) or 0,
  }

  -- Port 25: Standard SMTP for inbound email reception (open MX).
  -- Omit relay_hosts: empty Lua {} serializes as a map and KumoMTA expects
  -- a sequence. Default is localhost-only; external senders deliver via
  -- relay_to / listener_domains, not as trusted relays.
  kumo.start_esmtp_listener {
    listen = '0.0.0.0:25',
    hostname = constants.hostname,
  }

  -- HTTP listener for health checks only (no remote inject)
  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
    trusted_hosts = { '127.0.0.1', '::1' },
  }
end)
