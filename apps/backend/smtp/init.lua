local kumo = require 'kumo'

-- Load split modules
require 'policy.webhooks'
require 'policy.smtp'
require 'policy.queue'

local constants = require 'policy.constants'

-- Submission ports (outbound relay). Inbound MX is handled by the inbound service on :25.
-- 587 / 2025 / 2587 — STARTTLS (explicit TLS)
-- 465 / 2465 — same listeners; for true SMTPS (implicit TLS) terminate TLS upstream
--              (Coolify/Traefik/HAProxy) and forward cleartext to these ports.
local SUBMISSION_PORTS = { 465, 587, 2025, 2465, 2587 }

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

  for _, port in ipairs(SUBMISSION_PORTS) do
    kumo.start_esmtp_listener {
      listen = '0.0.0.0:' .. tostring(port),
      hostname = constants.hostname,
      relay_hosts = constants.trusted_hosts,
    }
  end

  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
    trusted_hosts = constants.trusted_hosts,
  }
end)
