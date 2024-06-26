import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";
import { releaseList } from "./commands/release-list";

export default {
  async fetch(
    request: Request,
    env: SlackEdgeAppEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const app = new SlackApp({ env });
    releaseList(app);
    return await app.run(request, ctx);
  },
};
