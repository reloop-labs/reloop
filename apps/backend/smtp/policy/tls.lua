-- Pure TLS policy helpers. Keep in sync with apps/backend/smtp/test/tls-policy.test.ts
local tls = {}

function tls.normalize_tls_mode(mode)
  if type(mode) == 'string' and string.lower(mode) == 'enforced' then
    return 'enforced'
  end
  return 'opportunistic'
end

function tls.egress_pool(tenant)
  if tenant == 'enforced' then
    return 'tls_enforced'
  end
  return 'tls_opportunistic'
end

function tls.is_development(env)
  return env == 'development' or env == 'dev' or env == 'local'
end

-- OpportunisticInsecure: STARTTLS when advertised, skip cert checks, fall
-- back to plaintext if the MX has no TLS. Matches dashboard "Opportunistic".
-- Required: bounce if the MX does not advertise TLS (dashboard "Enforced").
-- Local Mailpit has no STARTTLS, so development always stays opportunistic.
function tls.enable_tls(env, egress_source)
  if not tls.is_development(env) and egress_source == 'tls_enforced' then
    return 'Required'
  end
  return 'OpportunisticInsecure'
end

return tls
