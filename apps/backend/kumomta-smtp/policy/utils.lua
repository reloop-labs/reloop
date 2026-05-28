local constants = require 'policy.constants'

local utils = {}

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
    local pixel = string.format('<img src="%s/api/mail/v1/track/open/%s" width="1" height="1" style="display:none" alt="" />', tracking_base_url, email_log_id)
    if data:find("</body>") then
      data = data:gsub("</body>", pixel .. "</body>")
    else
      -- If no </body>, just append at end (naive but better than nothing)
      data = data .. pixel
    end
  end

  -- 2. Rewrite links (if click tracking enabled)
  if click_tracking then
    -- Aggressive approach for raw MIME/Quoted-Printable: href=3D"URL" or href="URL"
    data = data:gsub('(href=3D?["\']?)(https?://[^"%s >]+)(["\']?)', function(prefix, url, suffix)
      -- Skip if already tracked
      if url:find("/track/click") or url:find("/api/mail/v1/track/click") then
        return nil
      end
      -- Clean &amp; entity before encoding
      local clean_url = url:gsub("&[aA][mM][pP];", "&")
      local tracked_url = string.format("%s/api/mail/v1/track/click/%s?url=%s", tracking_base_url, email_log_id, utils.url_encode(clean_url))
      return prefix .. tracked_url .. suffix
    end)
  end

  return data
end

return utils
