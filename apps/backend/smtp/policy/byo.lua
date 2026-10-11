-- Pure bring-your-own SMTP routing helpers. Keep in sync with apps/backend/smtp/test/byo-policy.test.ts
--
-- A domain assigned to a customer SMTP provider gets its messages routed to a
-- synthetic routing_domain. get_queue_config / get_egress_path_config see
-- that routing domain, look the provider up, and relay to it as a smart host.
local byo = {}

local SUFFIX = '.byo.reloop.invalid'
local ID_PREFIX = 'smtp_'

-- 'smtp_abc123' -> 'abc123.byo.reloop.invalid' (nil if the id is malformed)
function byo.routing_domain_for(provider_id)
  if type(provider_id) ~= 'string' then
    return nil
  end
  local label = provider_id:match('^' .. ID_PREFIX .. '(%w+)$')
  if not label then
    return nil
  end
  return string.lower(label) .. SUFFIX
end

-- 'abc123.byo.reloop.invalid' -> 'smtp_abc123' (nil for normal domains)
function byo.provider_id_from_routing_domain(routing_domain)
  if type(routing_domain) ~= 'string' then
    return nil
  end
  local label = routing_domain:match('^(%w+)%.byo%.reloop%.invalid$')
  if not label then
    return nil
  end
  return ID_PREFIX .. label
end

-- starttls: certificate must validate (we hand over credentials).
-- none: plaintext, self-hosted only (enforced by the API).
function byo.enable_tls(security)
  if security == 'none' then
    return 'Disabled'
  end
  return 'Required'
end

-- mx_list entry pinned to the backend-vetted IP; name kept for TLS/SNI.
function byo.mx_entry(relay)
  return { name = relay.host, addr = relay.addr .. ':' .. tostring(relay.port) }
end

return byo
