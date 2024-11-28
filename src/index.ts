import {
  SlackOAuthApp,
  KVInstallationStore,
  KVStateStore,
} from "slack-cloudflare-workers";
import { ENV } from "./types";
import * as commends from "./commands";

const applyCommands = (app: SlackOAuthApp<ENV>) => {
  Object.values(commends).forEach((command) => {
    command(app);
  });
};

export default {
  async fetch(request: Request, env: ENV, ctx: ExecutionContext): Promise<Response> {
    const app = new SlackOAuthApp({
      env,
      installationStore: new KVInstallationStore(env, env.SLACK_INSTALLATIONS),
      stateStore: new KVStateStore(env.SLACK_OAUTH_STATES),
    });

    applyCommands(app);

    return await app.run(request, ctx);
  },
};
