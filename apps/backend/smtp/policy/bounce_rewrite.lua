-- bounce_rewrite.lua
--
-- Stop retrying full / over-quota mailboxes.
-- Gmail returns `452 4.2.2 OverQuotaTemp ... out of storage space`, which
-- KumoMTA would otherwise treat as transient and retry for days
-- (TransientFailure -> Scheduled Queue -> retry with backoff).
--
-- Per product policy we treat over-quota as an immediate permanent failure:
-- rewrite the 4xx to 552 so KumoMTA logs a `Bounce` (not `TransientFailure`)
-- and removes the message from the spool. The backend then suppresses the
-- contact with reason `mailbox_full`, blocking future sends platform-wide.
--
-- Docs: kumo.on('smtp_client_rewrite_delivery_status', fn(response, ...))
-- Return a 5xx code to bounce immediately, nil to keep default handling.

local kumo = require 'kumo'

-- Lower-cased substring match is enough; Gmail/Workspace variants all contain
-- one of these. Keep the list tight so we never rewrite unrelated 4xx
-- (greylisting, throttling, temp DNS errors must keep retrying).
local OVER_QUOTA_PATTERNS = {
  'overquotatemp',
  'over quota',
  'over-quota',
  'out of storage',
  'quota exceeded',
  'exceeded.*quota',
  'quota.*exceeded',
  'mailbox.*full',
  'mailbox.*over',
  'storage.*exceeded',
  'insufficient.*storage',
}

local function is_over_quota(response)
  if response == nil then
    return false
  end
  local s = string.lower(tostring(response))
  for _, pat in ipairs(OVER_QUOTA_PATTERNS) do
    -- plain=true: literal substring match, no Lua-pattern magic
    -- ('-' etc. must match literally, e.g. 'over-quota').
    if s:find(pat, 1, true) then
      return true
    end
  end
  return false
end

kumo.on('smtp_client_rewrite_delivery_status', function(response, domain, tenant, campaign, routing_domain)
  if is_over_quota(response) then
    -- 552 = "mailbox full" per RFC 3463 / SMTP enhanced codes.
    -- Any 5xx would bounce; 552 preserves the proper reason in logs.
    return 552
  end
  return nil
end)
