import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";

export default {
  async fetch(
    request: Request,
    env: SlackEdgeAppEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const app = new SlackApp({ env });

    return await app.run(request, ctx);
  },
};
