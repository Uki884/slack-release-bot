import { SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";

export const releaseList = (app: SlackApp<ENV>) => {
  app.command("/release-list-2",
    async (_req) => {
      return "What's up?";
    },
    async (req) => {
      const api = GithubApi.new(app.env);
      const prList = await api.getMergeablePr();
      console.log('prList', prList);

      await req.context.respond({
        text: `<@${req.context.userId}> さん、何かご用ですか？`
      });
    }
  );
}