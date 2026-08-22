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

local function file_exists(name)
  if not name or name == "" then return false end
  local f = io.open(name, "r")
  if f ~= nil then
    io.close(f)
    return true
  else
    return false
  end
end

local function setup_tls_certs()
  local cert_path = os.getenv("KUMOMTA_TLS_CERT")
  local key_path = os.getenv("KUMOMTA_TLS_KEY")

  local cert_data = os.getenv("KUMOMTA_TLS_CERT_DATA")
  local key_data = os.getenv("KUMOMTA_TLS_KEY_DATA")

  if cert_data and cert_data ~= "" and key_data and key_data ~= "" then
    os.execute("mkdir -p /opt/kumomta/etc/certs")
    local fc = io.open("/opt/kumomta/etc/certs/fullchain.pem", "w")
    if fc then
      fc:write(cert_data)
      fc:close()
      cert_path = "/opt/kumomta/etc/certs/fullchain.pem"
    end
    local fk = io.open("/opt/kumomta/etc/certs/privkey.pem", "w")
    if fk then
      fk:write(key_data)
      fk:close()
      key_path = "/opt/kumomta/etc/certs/privkey.pem"
    end
  end

  local candidate_paths = {
    { cert = cert_path, key = key_path },
    { cert = "/certs/fullchain.pem", key = "/certs/privkey.pem" },
    { cert = "/opt/kumomta/etc/certs/fullchain.pem", key = "/opt/kumomta/etc/certs/privkey.pem" },
    { cert = "/etc/letsencrypt/live/" .. constants.hostname .. "/fullchain.pem", key = "/etc/letsencrypt/live/" .. constants.hostname .. "/privkey.pem" },
  }

  for _, candidate in ipairs(candidate_paths) do
    if file_exists(candidate.cert) and file_exists(candidate.key) then
      print("[TLS] Using TLS certificate: " .. candidate.cert .. " and key: " .. candidate.key)
      return candidate.cert, candidate.key
    end
  end

  print("[TLS] No external TLS certificate found; KumoMTA will generate dynamic self-signed certificate.")
  return nil, nil
end

local tls_cert_path, tls_key_path = setup_tls_certs()

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
    local listener_config = {
      listen = '0.0.0.0:' .. tostring(port),
      hostname = constants.hostname,
    }
    if tls_cert_path and tls_key_path then
      listener_config.tls_certificate = tls_cert_path
      listener_config.tls_private_key = tls_key_path
    end
    kumo.start_esmtp_listener(listener_config)
  end

  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
    trusted_hosts = { '127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16' },
  }
end)
