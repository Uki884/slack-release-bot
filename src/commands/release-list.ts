import { SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";

export const releaseList = (app: SlackApp<ENV>) => {
  app.command("/release-list",
    async (_req) => {
      return "What's up?";
    },
    async (req) => {
      const api = GithubApi.new(app.env);
      const token = await api.getAccessToken();
      console.log('token', token);

      await req.context.respond({
        text: `<@${req.context.userId}> さん、何かご用ですか？`
      });
    }
  );
}