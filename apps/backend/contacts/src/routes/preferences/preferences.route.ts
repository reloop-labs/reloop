import { Elysia } from "elysia";
import { generateTokenRoute } from "./generate-token/generate-token.route";
import { getPreferencesDataRoute } from "./get-preferences-data/get-preferences-data.route";
import { unsubscribeAllRoute } from "./unsubscribe-all/unsubscribe-all.route";
import { updatePreferenceRoute } from "./update-preference/update-preference.route";

export const preferencesRoutes = new Elysia({
  prefix: "/v1/preferences",
  name: "PreferencesRoutes",
})
  .use(generateTokenRoute)
  .use(getPreferencesDataRoute)
  .use(updatePreferenceRoute)
  .use(unsubscribeAllRoute);
