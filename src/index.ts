import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";

export default {
  async fetch(
    request: Request,
    env: SlackEdgeAppEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const app = new SlackApp({ env });
    app.command("/release-list",
      async (_req) => {
        return "What's up?";
      },
      async (req) => {
        await req.context.respond({
          text: "Hey! This is an async response!"
        });
      }
    );
    return await app.run(request, ctx);
  },
};
