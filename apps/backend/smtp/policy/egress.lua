-- Pure sending-IP routing helpers. Keep in sync with apps/backend/smtp/test/egress-policy.test.ts
--
-- The tenant carries the TLS mode and, for an organization with a dedicated
-- IP, the address and hostname picked by the domain service:
--   'opportunistic'                              shared pool (host default IP)
--   'enforced|65.109.252.254|smtp.reloop.sh'     dedicated IP
-- get_queue_config turns the tenant into an egress pool of the same shape,
-- and get_egress_source turns that into a bound source address + EHLO name.
local egress = {}

local SEP = '|'

-- EGRESS_SOURCE_MAP="65.109.252.254=172.30.250.10,203.0.113.7=203.0.113.7"
-- maps each public sending IP to the local address KumoMTA binds to. With
-- host networking both sides are the same; in Docker the right side is the
-- container address whose traffic the host SNATs to the public IP. An IP
-- that is not listed is never bound, so its mail falls back to the shared
-- pool instead of failing every connection.
function egress.parse_source_map(raw)
  local map = {}
  if type(raw) ~= 'string' then
    return map
  end
  for entry in string.gmatch(raw, '[^,%s]+') do
    local public, bind = entry:match('^([^=]+)=([^=]+)$')
    if public and bind then
      map[public] = bind
    end
  end
  return map
end

function egress.tenant(tls_mode, address, hostname)
  if type(address) ~= 'string' or address == '' or type(hostname) ~= 'string' or hostname == '' then
    return tls_mode
  end
  return tls_mode .. SEP .. address .. SEP .. hostname
end

-- 'enforced|1.2.3.4|smtp.x' -> 'enforced', '1.2.3.4', 'smtp.x'
function egress.split(name)
  if type(name) ~= 'string' then
    return '', nil, nil
  end
  local base, address, hostname = name:match('^([^|]*)|([^|]+)|([^|]+)$')
  if base then
    return base, address, hostname
  end
  return name, nil, nil
end

-- Pool (and source) name for a queue: TLS pool plus the dedicated IP, if any.
function egress.pool_name(tls_pool, address, hostname)
  if not address or not hostname then
    return tls_pool
  end
  return tls_pool .. SEP .. address .. SEP .. hostname
end

-- Egress source config for a pool/source name, or nil if the name carries an
-- IP we cannot bind (caller falls back to the shared source).
function egress.source(name, source_map, default_ehlo)
  local base, address, hostname = egress.split(name)
  if not address then
    return { name = name, ehlo_domain = default_ehlo }
  end
  local bind = source_map[address]
  if not bind then
    return nil
  end
  return { name = name, source_address = bind, ehlo_domain = hostname }
end

return egress
