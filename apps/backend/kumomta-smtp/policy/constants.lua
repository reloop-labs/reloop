local constants = {}

constants.kumomta_key = os.getenv("X_KUMOMTA_KEY") or "reloop"
constants.base_url = os.getenv("BASE_URL") or "https://local.reloop.sh"

return constants
