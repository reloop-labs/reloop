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

-- KumoMTA min_free_space is a percentage string ("10%") or a byte count (number).
-- Env values like "10MB" must be converted; passing them through crashes kumod.
local function parse_min_free_space(raw)
  if raw == nil or raw == '' then
    return '1%'
  end
  local s = tostring(raw):match('^%s*(.-)%s*$')
  if s:match('^%d+%%$') then
    return s
  end
  local as_number = tonumber(s)
  if as_number then
    return as_number
  end
  local num, unit = s:match('^(%d+%.?%d*)%s*([A-Za-z]+)$')
  if num and unit then
    local multipliers = {
      b = 1, byte = 1, bytes = 1,
      k = 1024, kb = 1024, kib = 1024,
      m = 1024 * 1024, mb = 1024 * 1024, mib = 1024 * 1024,
      g = 1024 * 1024 * 1024, gb = 1024 * 1024 * 1024, gib = 1024 * 1024 * 1024,
      t = 1024 * 1024 * 1024 * 1024, tb = 1024 * 1024 * 1024 * 1024, tib = 1024 * 1024 * 1024 * 1024,
    }
    local mul = multipliers[unit:lower()]
    if mul then
      return math.floor(tonumber(num) * mul)
    end
  end
  print('[WARN] invalid KUMOMTA_MIN_FREE_SPACE=' .. s .. '; using 1%')
  return '1%'
end

local min_free_space = parse_min_free_space(os.getenv("KUMOMTA_MIN_FREE_SPACE"))
local min_free_inodes = tonumber(os.getenv("KUMOMTA_MIN_FREE_INODES")) or 0

kumo.on('init', function()
  kumo.define_spool {
    name = 'data',
    path = '/var/spool/kumomta/data',
    min_free_space = min_free_space,
    min_free_inodes = min_free_inodes,
  }

  kumo.define_spool {
    name = 'meta',
    path = '/var/spool/kumomta/meta',
    min_free_space = min_free_space,
    min_free_inodes = min_free_inodes,
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
