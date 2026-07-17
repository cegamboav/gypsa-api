import { createApp } from "./app.js";
import { APP_NAME, APP_VERSION } from "./config/app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(
    `[${APP_NAME}] v${APP_VERSION} listening on :${env.PORT} (${env.NODE_ENV})`,
  );
  console.log(
    `[${APP_NAME}] POST /api/v1/contact → ${env.CONTACT_TO_EMAIL}`,
  );
});
