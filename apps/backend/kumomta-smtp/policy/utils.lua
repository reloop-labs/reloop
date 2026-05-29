local constants = require 'policy.constants'

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
function utils.encode_tracking_token(email_log_id, url)
  local signed_content
  if url then
    signed_content = email_log_id .. ":" .. url
  else
    signed_content = email_log_id
  end

  -- HMAC-SHA256, take first 16 hex chars (matches TS: .digest("hex").slice(0, 16))
  local key_source = { key_data = constants.tracking_secret }
  local sig = _kumo.digest.hmac_sha256(key_source, signed_content).hex:sub(1, 16)

  local token_obj
  if url then
    token_obj = { id = email_log_id, url = url, s = sig }
  else
    token_obj = { id = email_log_id, s = sig }
  end

  local json_str = _kumo.serde.json_encode(token_obj)
  return _kumo.encode.base64url_nopad_encode(json_str)
end

function utils.inject_tracking(data, email_log_id, tracking_domain, click_tracking, open_tracking)
  -- Default click_tracking and open_tracking to true if nil (backward compatibility)
  if click_tracking == nil then click_tracking = true end
  if open_tracking == nil then open_tracking = true end

  -- Only proceed if it looks like HTML
  if not data:find("text/html") then
    return data
  end

  local tracking_base_url
  if tracking_domain and tracking_domain ~= "" then
    -- Detect protocol from constants.base_url or default to https://
    local protocol = constants.base_url:match("^(https?://)") or "https://"
    tracking_base_url = protocol .. tracking_domain
  else
    tracking_base_url = constants.base_url:gsub("/+$", "")
  end

  -- 1. Inject pixel before </body> (if open tracking enabled)
  if open_tracking then
    local open_token = utils.encode_tracking_token(email_log_id, nil)
    local pixel = string.format('<img src="%s/api/mail/v1/track/open/%s" width="1" height="1" style="display:none" alt="" />', tracking_base_url, open_token)
    if data:find("</body>") then
      data = data:gsub("</body>", pixel .. "</body>")
    else
      -- If no </body>, just append at end (naive but better than nothing)
      data = data .. pixel
    end
  end

  -- 2. Rewrite links (if click tracking enabled)
  if click_tracking then
    -- Join QP soft line breaks (=\r\n) so href URLs are not split across lines
    data = data:gsub("=\r?\n", "")

    -- Rewrite href links in the now-joined content
    data = data:gsub('(href=3D?["\']?)(https?://[^"%s >]+)(["\']?)', function(prefix, url, suffix)
      -- Skip if already tracked
      if url:find("/track/click") or url:find("/api/mail/v1/track/click") then
        return nil
      end
      -- Clean &amp; entity and QP =3D artifacts before encoding
      local clean_url = url:gsub("&[aA][mM][pP];", "&"):gsub("=3D", "=")
      local click_token = utils.encode_tracking_token(email_log_id, clean_url)
      local tracked_url = string.format("%s/api/mail/v1/track/click/%s", tracking_base_url, click_token)
      return prefix .. tracked_url .. suffix
    end)
  end

  return data
end

return utils

