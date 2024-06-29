import { ActionsBlock, ContextBlock, SectionBlock, SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";
import { BLOCK_ID_LIST } from "../constants/BLOCK_ID_LIST";
import { dividerBlock } from "../blocks/dividerBlock";

export const releaseStaging = (app: SlackApp<ENV>) => {
  return app.command(
    "/release-list-2",
    async (_req) => {
      return "リリースできそうなPRをもってきます！😃";
    },
    async (req) => {
      const api = GithubApi.new(app.env);
      const prList = await api.getMergeablePr();

      await req.context.respond({
        unfurl_links: true,
        text: "リリースできそうなPRはこちらです！😃",
        blocks: [],
      });
    },
  );
};
