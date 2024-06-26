import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";

export const releaseList = (app: SlackApp<SlackEdgeAppEnv>) => {
  app.command("/release-list",
    async (_req) => {
      return "What's up?";
    },
    async (req) => {
      await req.context.respond({
        text: `<@${req.context.userId}> さん、何かご用ですか？`
      });
    }
  );
}