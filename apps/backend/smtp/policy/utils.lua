local constants = require 'policy.constants'
local tls = require 'policy.tls'

local utils = {}

-- kumo runtime reference, set via utils.init(kumo) from smtp.lua
local _kumo

function utils.init(kumo_ref)
  _kumo = kumo_ref
end

function utils.url_encode(str)
  if str then
    str = str:gsub("\n", "\r\n")
    str = str:gsub("([^%w %-%_%.%~])", function(c)
      return string.format("%%%02X", string.byte(c))
    end)
    str = str:gsub(" ", "+")
  end
  return str
end

--- Build a single base64url token that mirrors the TypeScript `encodeTrackingToken`.
--- Token layout: base64url( JSON { id, [url], s } )
---   where s = first 16 hex chars of HMAC-SHA256( id [+ ":" + url] , TRACKING_SECRET )
---
--- For open tracking  → encode_tracking_token(emailLogId, nil)
--- For click tracking → encode_tracking_token(emailLogId, destinationUrl)
function utils.encode_tracking_token(email_log_id, url, click_tracking)
  if click_tracking == nil then click_tracking = true end

  local signed_content
  if url and click_tracking then
    signed_content = email_log_id .. ":" .. url
  elseif url then
    signed_content = "nt:" .. email_log_id .. ":" .. url
  else
    signed_content = email_log_id
  end

  -- HMAC-SHA256, take first 16 hex chars (matches TS: .digest("hex").slice(0, 16))
  local key_source = { key_data = constants.tracking_secret }
  local sig = _kumo.digest.hmac_sha256(key_source, signed_content).hex:sub(1, 16)

  local token_obj
  if url and click_tracking then
    token_obj = { id = email_log_id, url = url, s = sig }
  elseif url then
    token_obj = { id = email_log_id, url = url, nt = 1, s = sig }
  else
    token_obj = { id = email_log_id, s = sig }
  end

  local json_str = _kumo.serde.json_encode(token_obj)
  return _kumo.encode.base64url_nopad_encode(json_str)
end

function utils.decode_tracking_token(token)
  local status, json_str = pcall(function()
    return _kumo.encode.base64url_nopad_decode(token)
  end)
  if not status or not json_str then
    return nil
  end

  local parse_status, obj = pcall(function()
    return _kumo.serde.json_parse(json_str)
  end)
  if not parse_status or not obj or not obj.id or not obj.s then
    return nil
  end

  -- Verify signature
  local signed_content
  if obj.url and obj.nt == 1 then
    signed_content = "nt:" .. obj.id .. ":" .. obj.url
  elseif obj.url then
    signed_content = obj.id .. ":" .. obj.url
  else
    signed_content = obj.id
  end

  local key_source = { key_data = constants.tracking_secret }
  local sig = _kumo.digest.hmac_sha256(key_source, signed_content).hex:sub(1, 16)

  if sig == obj.s then
    return obj
  end
  return nil
end

function utils.inject_tracking(data, email_log_id, tracking_domain, click_tracking, open_tracking)
  -- Default click_tracking and open_tracking to true if nil (backward compatibility)
  if click_tracking == nil then click_tracking = true end
  if open_tracking == nil then open_tracking = true end

  if not data:find("text/html", 1, true) then
    return data
  end

  local parsed, root = pcall(_kumo.mimepart.parse, data)
  if not parsed then
    return data
  end

  local html_part = root:get_simple_structure().html_part
  if not html_part then
    return data
  end

  local html = html_part.body

  local tracking_base_url
  if tracking_domain and tracking_domain ~= "" then
    -- Custom customer host (e.g. link.example.com → CNAME → link.reloop.sh)
    local protocol = constants.base_url:match("^(https?://)") or "https://"
    tracking_base_url = protocol .. tracking_domain
  else
    -- Platform links app (link.reloop.sh), not the API/marketing host
    tracking_base_url = constants.tracking_base_url
  end

  -- 1. Inject pixel before </body> (if open tracking enabled)
  if open_tracking then
    local open_token = utils.encode_tracking_token(email_log_id, nil)
    local pixel = string.format('<img src="%s/api/mail/v1/track/open/%s" width="1" height="1" style="display:none" alt="" />', tracking_base_url, open_token)
    if html:find("</body>") then
      html = html:gsub("</body>", pixel .. "</body>")
    else
      -- If no </body>, just append at end (naive but better than nothing)
      html = html .. pixel
    end
  end

  -- 2. Rewrite links (always, using click_tracking flag)
  html = html:gsub('(href=["\']?)(https?://[^"\'%s >]+)(["\']?)', function(prefix, url, suffix)
    -- Clean &amp; entity before encoding
    local clean_url = url:gsub("&[aA][mM][pP];", "&")

    -- Check if it is already a redirect URL
    local existing_token = clean_url:match("/redirect/([%w%-_]+)")
    if existing_token then
      local decoded = utils.decode_tracking_token(existing_token)
      if decoded and decoded.url then
        clean_url = decoded.url
      else
        -- Fallback: decode without signature verification
        local status, json_str = pcall(function()
          return _kumo.encode.base64url_nopad_decode(existing_token)
        end)
        if status and json_str then
          local parse_status, obj = pcall(function()
            return _kumo.serde.json_parse(json_str)
          end)
          if parse_status and obj and obj.url then
            clean_url = obj.url
          else
            return nil
          end
        else
          return nil
        end
      end
    end

    local click_token = utils.encode_tracking_token(email_log_id, clean_url, click_tracking)
    local tracked_url = string.format("%s/redirect/%s", tracking_base_url, click_token)
    return prefix .. tracked_url .. suffix
  end)

  html_part.body = html
  return tostring(root)
end

function utils.normalize_tls_mode(mode)
  return tls.normalize_tls_mode(mode)
end

--- Stamp TLS policy on the message so get_queue_config can pick an egress pool.
--- Tenant is the KumoMTA queue dimension that flows into egress_source.
function utils.apply_tls_mode(msg, mode)
  local tls_mode = tls.normalize_tls_mode(mode)
  msg:set_meta('tls_mode', tls_mode)
  msg:set_meta('tenant', tls_mode)
  print("[TLS] [" .. msg:id() .. "] mode=" .. tls_mode)
  return tls_mode
end

return utils
