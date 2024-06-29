import { ExecutionContext, SlackApp } from "slack-cloudflare-workers";
import { ENV } from "./types";
import * as commends from "./commands";

const applyCommands = (app: SlackApp<ENV>) => {
  Object.values(commends).forEach((command) => {
    command(app);
  });
};

export default {
  async fetch(request: Request, env: ENV, ctx: ExecutionContext): Promise<Response> {
    const app = new SlackApp({ env });
    applyCommands(app);

    return await app.run(request, ctx);
  },
};
